from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from datetime import datetime, timedelta
import json
import os
import uuid

app = Flask(__name__)
app.secret_key = 'salon_beleza_dourada_secret_key'

# Dados dos serviços expandidos
SERVICES = {
    'manicure': [
        {
            'id': 1,
            'name': 'Cutilagem Tradicional',
            'description': 'Retirada de cutícula e lixamento das unhas',
            'price': 20.00,
            'duration': '30 min',
            'category': 'manicure',
            'image': '✂️'
        },
        {
            'id': 2,
            'name': 'Esmaltação Simples',
            'description': 'Aplicação de esmalte básico',
            'price': 15.00,
            'duration': '20 min',
            'category': 'manicure',
            'image': '💅'
        },
        {
            'id': 3,
            'name': 'Francesinha',
            'description': 'Esmaltação com pontinha branca clássica',
            'price': 25.00,
            'duration': '40 min',
            'category': 'manicure',
            'image': '🤍'
        },
        {
            'id': 4,
            'name': 'Unha Decorada',
            'description': 'Desenhos, carimbos, pedrarias, adesivos, glitter',
            'price': 35.00,
            'duration': '60 min',
            'category': 'manicure',
            'image': '🎨'
        },
        {
            'id': 5,
            'name': 'Blindagem de Unhas',
            'description': 'Aplicação de produtos para fortalecer e evitar quebras',
            'price': 30.00,
            'duration': '45 min',
            'category': 'manicure',
            'image': '🛡️'
        },
        {
            'id': 6,
            'name': 'Banho de Gel',
            'description': 'Camada de gel para dar resistência e brilho',
            'price': 40.00,
            'duration': '50 min',
            'category': 'manicure',
            'image': '✨'
        },
        {
            'id': 7,
            'name': 'Spa das Mãos',
            'description': 'Esfoliação, hidratação, máscara nutritiva, massagem',
            'price': 45.00,
            'duration': '60 min',
            'category': 'spa',
            'image': '🧖‍♀️'
        },
        {
            'id': 8,
            'name': 'Banho de Parafina',
            'description': 'Tratamento para hidratação profunda',
            'price': 35.00,
            'duration': '40 min',
            'category': 'spa',
            'image': '🕯️'
        }
    ],
    'alongamento': [
        {
            'id': 9,
            'name': 'Fibra de Vidro',
            'description': 'Alongamento com fibra de vidro resistente',
            'price': 60.00,
            'duration': '90 min',
            'category': 'alongamento',
            'image': '💎'
        },
        {
            'id': 10,
            'name': 'Gel Moldado',
            'description': 'Alongamento com gel moldado na mão',
            'price': 70.00,
            'duration': '100 min',
            'category': 'alongamento',
            'image': '💫'
        },
        {
            'id': 11,
            'name': 'Acrílico',
            'description': 'Alongamento em acrílico tradicional',
            'price': 55.00,
            'duration': '85 min',
            'category': 'alongamento',
            'image': '💪'
        },
        {
            'id': 12,
            'name': 'Tips',
            'description': 'Alongamento com tips de plástico',
            'price': 50.00,
            'duration': '80 min',
            'category': 'alongamento',
            'image': '📏'
        },
        {
            'id': 13,
            'name': 'Acrygel',
            'description': 'Alongamento híbrido acrílico + gel',
            'price': 75.00,
            'duration': '110 min',
            'category': 'alongamento',
            'image': '🔥'
        },
        {
            'id': 14,
            'name': 'Manutenção de Alongamento',
            'description': 'Retoque do crescimento',
            'price': 35.00,
            'duration': '60 min',
            'category': 'alongamento',
            'image': '🔧'
        }
    ],
    'pedicure': [
        {
            'id': 15,
            'name': 'Cutilagem e Lixamento',
            'description': 'Limpeza das cutículas e unhas dos pés',
            'price': 25.00,
            'duration': '40 min',
            'category': 'pedicure',
            'image': '🦶'
        },
        {
            'id': 16,
            'name': 'Esmaltação Simples Pés',
            'description': 'Aplicação de esmalte básico nos pés',
            'price': 20.00,
            'duration': '25 min',
            'category': 'pedicure',
            'image': '💅'
        },
        {
            'id': 17,
            'name': 'Francesinha nos Pés',
            'description': 'Esmaltação francesa nos pés',
            'price': 30.00,
            'duration': '45 min',
            'category': 'pedicure',
            'image': '🤍'
        },
        {
            'id': 18,
            'name': 'Unha Decorada Pés',
            'description': 'Arte personalizada nas unhas dos pés',
            'price': 40.00,
            'duration': '50 min',
            'category': 'pedicure',
            'image': '🎨'
        },
        {
            'id': 19,
            'name': 'Remoção de Calosidades',
            'description': 'Lixa ou peeling químico para pés',
            'price': 35.00,
            'duration': '45 min',
            'category': 'podologia',
            'image': '🪚'
        },
        {
            'id': 20,
            'name': 'Podalismo Estético',
            'description': 'Tratamento de pés ressecados, rachaduras, fissuras',
            'price': 50.00,
            'duration': '70 min',
            'category': 'podologia',
            'image': '🩹'
        },
        {
            'id': 21,
            'name': 'Spa dos Pés',
            'description': 'Esfoliação, hidratação, massagem relaxante',
            'price': 55.00,
            'duration': '75 min',
            'category': 'spa',
            'image': '🧖‍♀️'
        },
        {
            'id': 22,
            'name': 'Banho de Parafina Pés',
            'description': 'Tratamento para pés secos',
            'price': 40.00,
            'duration': '50 min',
            'category': 'spa',
            'image': '🕯️'
        },
        {
            'id': 23,
            'name': 'Reflexologia Podal',
            'description': 'Massagem terapêutica nos pés',
            'price': 60.00,
            'duration': '60 min',
            'category': 'terapeutico',
            'image': '👐'
        },
        {
            'id': 24,
            'name': 'Unhas Encravadas',
            'description': 'Tratamento de unhas encravadas leves',
            'price': 45.00,
            'duration': '50 min',
            'category': 'podologia',
            'image': '🔍'
        },
        {
            'id': 25,
            'name': 'Higienização Profunda',
            'description': 'Limpeza completa e profunda dos pés',
            'price': 40.00,
            'duration': '55 min',
            'category': 'podologia',
            'image': '🧽'
        },
        {
            'id': 26,
            'name': 'Correção Estética de Unhas',
            'description': 'Correção de formato e aparência das unhas',
            'price': 35.00,
            'duration': '45 min',
            'category': 'podologia',
            'image': '📐'
        }
    ]
}

# Usuários e dados em memória (em produção usar banco de dados)
users_db = {}
bookings_db = []
admin_credentials = {'username': 'Erides Souza', 'password': '301985'}

def load_data():
    """Carrega dados dos arquivos JSON se existirem"""
    global users_db, bookings_db

    if os.path.exists('users.json'):
        with open('users.json', 'r', encoding='utf-8') as f:
            users_db = json.load(f)

    if os.path.exists('bookings.json'):
        with open('bookings.json', 'r', encoding='utf-8') as f:
            bookings_db = json.load(f)

def save_data():
    """Salva dados nos arquivos JSON"""
    with open('users.json', 'w', encoding='utf-8') as f:
        json.dump(users_db, f, ensure_ascii=False, indent=2)

    with open('bookings.json', 'w', encoding='utf-8') as f:
        json.dump(bookings_db, f, ensure_ascii=False, indent=2)

def get_all_services():
    """Retorna todos os serviços em uma lista única"""
    all_services = []
    for category in SERVICES.values():
        all_services.extend(category)
    return all_services

def is_birthday(birth_date):
    """Verifica se hoje é aniversário do usuário"""
    try:
        today = datetime.now()
        birth = datetime.strptime(birth_date, '%Y-%m-%d')
        return today.month == birth.month and today.day == birth.day
    except:
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        user_type = data.get('userType', 'client')

        if user_type == 'admin':
            if username == admin_credentials['username'] and password == admin_credentials['password']:
                session['user'] = {
                    'id': 'admin',
                    'name': username,
                    'type': 'admin'
                }
                return jsonify({'success': True, 'redirect': '/admin'})
            else:
                return jsonify({'success': False, 'message': 'Credenciais administrativas inválidas'})

        # Login de cliente
        user = users_db.get(username)
        if user and user['password'] == password:
            session['user'] = user
            return jsonify({'success': True, 'redirect': '/dashboard'})
        else:
            return jsonify({'success': False, 'message': 'Usuário ou senha inválidos'})

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()

        if data['username'] in users_db:
            return jsonify({'success': False, 'message': 'Usuário já existe'})

        user = {
            'id': str(uuid.uuid4()),
            'username': data['username'],
            'password': data['password'],
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'birth_date': data['birthDate'],
            'type': 'client',
            'loyalty_points': 0,
            'total_visits': 0,
            'created_at': datetime.now().isoformat()
        }

        users_db[data['username']] = user
        save_data()

        return jsonify({'success': True, 'message': 'Usuário criado com sucesso'})

    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))

    user = session['user']
    user_bookings = [b for b in bookings_db if b.get('user_id') == user['id']]

    # Verifica se é aniversário
    birthday = is_birthday(user.get('birth_date', ''))

    return render_template('dashboard.html', 
                         user=user, 
                         bookings=user_bookings,
                         services=get_all_services(),
                         is_birthday=birthday)

@app.route('/admin')
def admin():
    if 'user' not in session or session['user']['type'] != 'admin':
        return redirect(url_for('login'))

    # Estatísticas do admin
    today = datetime.now().date()
    today_bookings = [b for b in bookings_db if b.get('date') == today.isoformat()]

    stats = {
        'today_bookings': len(today_bookings),
        'today_revenue': sum(b.get('price', 0) for b in today_bookings),
        'total_clients': len(users_db),
        'total_bookings': len(bookings_db)
    }

    return render_template('admin.html', 
                         stats=stats,
                         bookings=bookings_db,
                         services=get_all_services())

@app.route('/api/services')
def api_services():
    return jsonify(get_all_services())

@app.route('/api/book', methods=['POST'])
def api_book():
    if 'user' not in session:
        return jsonify({'success': False, 'message': 'Usuário não logado'})

    data = request.get_json()
    user = session['user']

    # Encontra o serviço
    service = None
    for s in get_all_services():
        if s['id'] == data['service_id']:
            service = s
            break

    if not service:
        return jsonify({'success': False, 'message': 'Serviço não encontrado'})

    # Verifica conflitos de horário
    existing_booking = next((b for b in bookings_db 
                           if b.get('date') == data['date'] 
                           and b.get('time') == data['time']
                           and b.get('status') != 'cancelled'), None)

    if existing_booking:
        return jsonify({'success': False, 'message': 'Horário já ocupado'})

    # Calcula preço com desconto de aniversário
    price = service['price']
    discount_applied = False
    if is_birthday(user.get('birth_date', '')):
        price *= 0.9  # 10% de desconto
        discount_applied = True

    booking = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'user_name': user['name'],
        'service_id': service['id'],
        'service_name': service['name'],
        'date': data['date'],
        'time': data['time'],
        'price': price,
        'original_price': service['price'],
        'discount_applied': discount_applied,
        'status': 'confirmed',
        'notes': data.get('notes', ''),
        'created_at': datetime.now().isoformat()
    }

    bookings_db.append(booking)

    # Atualiza pontos de fidelidade do usuário
    if user['username'] in users_db:
        users_db[user['username']]['loyalty_points'] += int(price)
        users_db[user['username']]['total_visits'] += 1

    save_data()

    return jsonify({'success': True, 'booking': booking})

@app.route('/api/cancel_booking', methods=['POST'])
def api_cancel_booking():
    if 'user' not in session:
        return jsonify({'success': False, 'message': 'Usuário não logado'})

    data = request.get_json()
    booking_id = data.get('booking_id')

    booking = next((b for b in bookings_db if b['id'] == booking_id), None)

    if not booking:
        return jsonify({'success': False, 'message': 'Agendamento não encontrado'})

    user = session['user']
    if booking['user_id'] != user['id'] and user['type'] != 'admin':
        return jsonify({'success': False, 'message': 'Não autorizado'})

    booking['status'] = 'cancelled'
    save_data()

    return jsonify({'success': True, 'message': 'Agendamento cancelado'})

@app.route('/api/admin/bookings', methods=['GET', 'POST'])
def api_admin_bookings():
    if 'user' not in session or session['user']['type'] != 'admin':
        return jsonify({'success': False, 'message': 'Acesso negado'})

    if request.method == 'GET':
        return jsonify({'bookings': bookings_db})

    if request.method == 'POST':
        data = request.get_json()
        action = data.get('action')
        booking_id = data.get('booking_id')

        booking = next((b for b in bookings_db if b['id'] == booking_id), None)

        if not booking:
            return jsonify({'success': False, 'message': 'Agendamento não encontrado'})

        if action == 'update_status':
            booking['status'] = data.get('status')
        elif action == 'update_notes':
            booking['admin_notes'] = data.get('notes', '')

        save_data()
        return jsonify({'success': True, 'booking': booking})

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    load_data()
    app.run(host='0.0.0.0', port=5000, debug=True)