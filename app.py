
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import hashlib

app = Flask(__name__)
app.secret_key = 'beauty_salon_secret_key_2024'
CORS(app, origins=["http://localhost:5000", "http://0.0.0.0:5000", "https://*.replit.dev", "https://*.repl.co"])

# Dados em memória para demonstração
users_db = []
bookings_db = []
services_db = [
    {
        'id': 1,
        'name': 'Manicure Clássica',
        'emoji': '💅',
        'description': 'Cuidado completo das unhas das mãos',
        'price': 25.00,
        'duration': 45,
        'category': 'manicure'
    },
    {
        'id': 2,
        'name': 'Pedicure Spa',
        'emoji': '🦶',
        'description': 'Tratamento relaxante para os pés',
        'price': 35.00,
        'duration': 60,
        'category': 'pedicure'
    },
    {
        'id': 3,
        'name': 'Manicure + Pedicure',
        'emoji': '✨',
        'description': 'Pacote completo com desconto especial',
        'price': 50.00,
        'duration': 90,
        'category': 'combo'
    }
]

# Arquivos de persistência
DATA_DIR = 'data'
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
BOOKINGS_FILE = os.path.join(DATA_DIR, 'bookings.json')
SERVICES_FILE = os.path.join(DATA_DIR, 'services.json')

# Criar diretório de dados se não existir
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Carregar dados dos arquivos
def load_data():
    global users_db, bookings_db, services_db
    
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                users_db = json.load(f)
    except:
        users_db = []
        
    try:
        if os.path.exists(BOOKINGS_FILE):
            with open(BOOKINGS_FILE, 'r', encoding='utf-8') as f:
                bookings_db = json.load(f)
    except:
        bookings_db = []
        
    try:
        if os.path.exists(SERVICES_FILE):
            with open(SERVICES_FILE, 'r', encoding='utf-8') as f:
                loaded_services = json.load(f)
                if loaded_services:
                    services_db = loaded_services
    except:
        pass  # Manter serviços padrão

# Salvar dados nos arquivos
def save_data():
    try:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users_db, f, ensure_ascii=False, indent=2)
        with open(BOOKINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(bookings_db, f, ensure_ascii=False, indent=2)
        with open(SERVICES_FILE, 'w', encoding='utf-8') as f:
            json.dump(services_db, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Erro ao salvar dados: {e}")

# Carregar dados na inicialização
load_data()

@app.route('/')
def index():
    return redirect('/dashboard')

@app.route('/dashboard')
def dashboard():
    return render_template('index.html')

# Endpoint de sincronização para buscar todos os dados
@app.route('/api/sync', methods=['GET'])
def api_sync():
    return jsonify({
        'users': users_db,
        'bookings': bookings_db,
        'services': services_db,
        'timestamp': datetime.now().isoformat()
    })

# Endpoint para sincronizar usuários
@app.route('/api/sync/users', methods=['POST'])
def api_sync_users():
    global users_db
    data = request.get_json()
    if isinstance(data, list):
        # Mesclar usuários únicos
        existing_ids = {user.get('id') for user in users_db}
        for user in data:
            if user.get('id') not in existing_ids:
                users_db.append(user)
        save_data()
    return jsonify({'success': True, 'count': len(users_db)})

# Endpoint para sincronizar agendamentos
@app.route('/api/sync/bookings', methods=['POST'])
def api_sync_bookings():
    global bookings_db
    data = request.get_json()
    if isinstance(data, list):
        # Mesclar agendamentos únicos
        existing_ids = {booking.get('id') for booking in bookings_db}
        for booking in data:
            if booking.get('id') not in existing_ids:
                bookings_db.append(booking)
        save_data()
    return jsonify({'success': True, 'count': len(bookings_db)})

# Endpoint para sincronizar serviços
@app.route('/api/sync/services', methods=['POST'])
def api_sync_services():
    global services_db
    data = request.get_json()
    if isinstance(data, list):
        services_db = data
        save_data()
    return jsonify({'success': True, 'count': len(services_db)})

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Admin login
    if username == "Erides Souza" and password == "301985":
        session['user'] = {
            'id': 'admin',
            'name': 'Erides Souza',
            'username': username,
            'role': 'admin'
        }
        return jsonify({'success': True, 'user': session['user']})
    
    # User login
    for user in users_db:
        if user['username'] == username and user['password'] == password:
            session['user'] = user
            return jsonify({'success': True, 'user': user})
    
    return jsonify({'success': False, 'message': 'Credenciais inválidas'})

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    
    # Verificar se usuário já existe
    for user in users_db:
        if user['username'] == data['username'] or user['email'] == data['email']:
            return jsonify({'success': False, 'message': 'Usuário já existe'})
    
    # Criar novo usuário
    new_user = {
        'id': len(users_db) + 1,
        'name': data['name'],
        'username': data['username'],
        'email': data['email'],
        'phone': data['phone'],
        'password': data['password'],
        'role': 'client',
        'birthday': data.get('birthday', ''),
        'loyaltyPoints': 0,
        'totalVisits': 0,
        'created_at': datetime.now().isoformat()
    }
    
    users_db.append(new_user)
    save_data()
    return jsonify({'success': True, 'message': 'Usuário criado com sucesso'})

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user', None)
    return jsonify({'success': True})

@app.route('/api/services')
def api_services():
    return jsonify(services_db)

@app.route('/api/services', methods=['POST'])
def api_add_service():
    data = request.get_json()
    new_service = {
        'id': len(services_db) + 1,
        'name': data['name'],
        'emoji': data.get('emoji', '⭐'),
        'description': data['description'],
        'price': float(data['price']),
        'duration': int(data['duration']),
        'category': data['category']
    }
    services_db.append(new_service)
    save_data()
    return jsonify({'success': True, 'service': new_service})

@app.route('/api/bookings', methods=['GET', 'POST'])
def api_bookings():
    if request.method == 'POST':
        data = request.get_json()
        new_booking = {
            'id': len(bookings_db) + 1,
            'user_id': data['user_id'],
            'service_id': data['service_id'],
            'serviceName': data.get('serviceName', ''),
            'date': data['date'],
            'time': data['time'],
            'status': 'confirmed',
            'price': data.get('price', 0),
            'duration': data.get('duration', 60),
            'created_at': datetime.now().isoformat()
        }
        bookings_db.append(new_booking)
        save_data()
        return jsonify({'success': True, 'booking': new_booking})
    
    return jsonify(bookings_db)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
