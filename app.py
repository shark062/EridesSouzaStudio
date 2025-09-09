
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import hashlib

app = Flask(__name__)
app.secret_key = 'beauty_salon_secret_key_2024'
CORS(app, origins=["http://localhost:5000", "http://0.0.0.0:5000"])

# Dados em memória para demonstração
users_db = []
bookings_db = []
services_db = [
    {
        'id': 1,
        'name': 'Manicure Clássica',
        'description': 'Cuidado completo das unhas das mãos',
        'price': 25.00,
        'duration': 45,
        'category': 'manicure'
    },
    {
        'id': 2,
        'name': 'Pedicure Spa',
        'description': 'Tratamento relaxante para os pés',
        'price': 35.00,
        'duration': 60,
        'category': 'pedicure'
    },
    {
        'id': 3,
        'name': 'Manicure + Pedicure',
        'description': 'Pacote completo com desconto especial',
        'price': 50.00,
        'duration': 90,
        'category': 'combo'
    }
]

@app.route('/')
def index():
    return redirect('/dashboard')

@app.route('/dashboard')
def dashboard():
    return render_template('index.html')

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
        'created_at': datetime.now().isoformat()
    }
    
    users_db.append(new_user)
    return jsonify({'success': True, 'message': 'Usuário criado com sucesso'})

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user', None)
    return jsonify({'success': True})

@app.route('/api/services')
def api_services():
    return jsonify(services_db)

@app.route('/api/bookings', methods=['GET', 'POST'])
def api_bookings():
    if request.method == 'POST':
        data = request.get_json()
        new_booking = {
            'id': len(bookings_db) + 1,
            'user_id': data['user_id'],
            'service_id': data['service_id'],
            'date': data['date'],
            'time': data['time'],
            'status': 'confirmed',
            'created_at': datetime.now().isoformat()
        }
        bookings_db.append(new_booking)
        return jsonify({'success': True, 'booking': new_booking})
    
    return jsonify(bookings_db)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
