from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from datetime import datetime, timedelta
import json
import os
import uuid
import sys

# Configuração de encoding para Python
if sys.version_info[0] >= 3:
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
app.secret_key = 'salon_beleza_dourada_secret_key_2024_super_secure_key_beleza_dourada'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

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

    try:
        if os.path.exists('users.json'):
            with open('users.json', 'r', encoding='utf-8') as f:
                users_db = json.load(f)
        else:
            users_db = {}
    except Exception as e:
        print(f"Erro ao carregar users.json: {e}")
        users_db = {}

    try:
        if os.path.exists('bookings.json'):
            with open('bookings.json', 'r', encoding='utf-8') as f:
                bookings_db = json.load(f)
        else:
            bookings_db = []
    except Exception as e:
        print(f"Erro ao carregar bookings.json: {e}")
        bookings_db = []

def save_data():
    """Salva dados nos arquivos JSON"""
    try:
        with open('users.json', 'w', encoding='utf-8') as f:
            json.dump(users_db, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Erro ao salvar users.json: {e}")

    try:
        with open('bookings.json', 'w', encoding='utf-8') as f:
            json.dump(bookings_db, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Erro ao salvar bookings.json: {e}")

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
    if request.method == 'GET':
        return render_template('login.html')

    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Dados não recebidos'}), 400

        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        print(f"Tentativa de login - Usuário: '{username}'")
        print(f"Admin username configurado: '{admin_credentials['username']}'")

        if not username or not password:
            return jsonify({'success': False, 'message': 'Usuário e senha são obrigatórios'})

        # Verificar credenciais do admin (case-sensitive)
        if username == admin_credentials['username'] and password == admin_credentials['password']:
            session.clear()  # Limpar sessão anterior
            session['user_id'] = 'admin'
            session['username'] = username
            session['is_admin'] = True
            session['user_type'] = 'admin'
            session.permanent = True
            print("✅ Login admin realizado com sucesso")
            save_data()
            return jsonify({
                'success': True, 
                'message': 'Login administrativo realizado com sucesso!',
                'redirect': '/admin',
                'user_type': 'admin'
            })

        # Verificar usuários regulares
        if username in users_db:
            user = users_db[username]
            if user.get('password') == password:
                session.clear()  # Limpar sessão anterior
                session['user_id'] = username
                session['username'] = username
                session['is_admin'] = False
                session['user_type'] = 'client'
                session['user_data'] = user
                session.permanent = True
                print(f"✅ Login cliente realizado com sucesso: {username}")
                save_data()
                return jsonify({
                    'success': True, 
                    'message': f'Bem-vindo(a), {user.get("name", username)}!',
                    'redirect': '/dashboard',
                    'user_type': 'client'
                })

        print("❌ Credenciais inválidas")
        return jsonify({'success': False, 'message': 'Usuário ou senha incorretos'})

    except Exception as e:
        print(f"❌ Erro no login: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

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
    if 'user_id' not in session or session['user_type'] != 'client':
        return redirect(url_for('login'))

    user_id = session['user_id']
    user = users_db.get(user_id)
    if not user:
        return redirect(url_for('login'))

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
    print(f"Acessando /admin - Session: {session.get('user_type', 'Não definido')}")

    if 'user_type' not in session or session['user_type'] != 'admin':
        print("Usuário não é admin ou não está logado, redirecionando para login")
        return redirect(url_for('login'))

    user = session.get('user_data')
    admin_username = session.get('username')
    print(f"Admin {admin_username} acessou o painel")

    # Estatísticas do admin
    today = datetime.now().date()
    today_bookings = [b for b in bookings_db if datetime.strptime(b.get('date'), '%Y-%m-%d').date() == today]

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
    if 'user_type' not in session or session['user_type'] != 'client':
        return jsonify({'success': False, 'message': 'Usuário não logado ou sem permissão'})

    data = request.get_json()
    user_id = session['user_id']
    user = users_db.get(user_id)

    if not user:
        return jsonify({'success': False, 'message': 'Usuário não encontrado'})

    # Encontra o serviço
    service_id = data.get('service_id')
    service = None
    for s_list in SERVICES.values():
        for s in s_list:
            if s['id'] == service_id:
                service = s
                break
        if service:
            break

    if not service:
        return jsonify({'success': False, 'message': 'Serviço não encontrado'})

    # Verifica conflitos de horário
    booking_date = data.get('date')
    booking_time = data.get('time')

    if not booking_date or not booking_time:
        return jsonify({'success': False, 'message': 'Data e hora são obrigatórias'})

    existing_booking = next((b for b in bookings_db 
                           if b.get('date') == booking_date 
                           and b.get('time') == booking_time
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
        'date': booking_date,
        'time': booking_time,
        'price': round(price, 2),
        'original_price': service['price'],
        'discount_applied': discount_applied,
        'status': 'confirmed',
        'notes': data.get('notes', ''),
        'created_at': datetime.now().isoformat()
    }

    bookings_db.append(booking)

    # Atualiza pontos de fidelidade do usuário
    users_db[user_id]['loyalty_points'] += int(price)
    users_db[user_id]['total_visits'] += 1

    save_data()

    return jsonify({'success': True, 'booking': booking})

@app.route('/api/cancel_booking', methods=['POST'])
def api_cancel_booking():
    if 'user_type' not in session or (session['user_type'] != 'client' and session['user_type'] != 'admin'):
        return jsonify({'success': False, 'message': 'Usuário não logado ou sem permissão'})

    data = request.get_json()
    booking_id = data.get('booking_id')

    booking = next((b for b in bookings_db if b['id'] == booking_id), None)

    if not booking:
        return jsonify({'success': False, 'message': 'Agendamento não encontrado'})

    user_type = session['user_type']
    user_id = session.get('user_id')

    if booking['user_id'] != user_id and user_type != 'admin':
        return jsonify({'success': False, 'message': 'Não autorizado a cancelar este agendamento'})

    booking['status'] = 'cancelled'
    save_data()

    return jsonify({'success': True, 'message': 'Agendamento cancelado'})

@app.route('/api/admin/bookings', methods=['GET', 'POST'])
def api_admin_bookings():
    if 'user_type' not in session or session['user_type'] != 'admin':
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
            new_status = data.get('status')
            if new_status:
                booking['status'] = new_status
            else:
                return jsonify({'success': False, 'message': 'Status não fornecido'})
        elif action == 'update_notes':
            booking['admin_notes'] = data.get('notes', '')
        else:
            return jsonify({'success': False, 'message': 'Ação desconhecida'})

        save_data()
        return jsonify({'success': True, 'booking': booking})

@app.route('/api/admin/change_credentials', methods=['POST'])
def api_admin_change_credentials():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({'success': False, 'message': 'Acesso negado'})

    data = request.get_json()
    new_username = data.get('new_username')
    new_password = data.get('new_password')

    if not new_username or not new_password:
        return jsonify({'success': False, 'message': 'Username e senha são obrigatórios'})

    # Atualiza credenciais do admin
    global admin_credentials
    admin_credentials['username'] = new_username
    admin_credentials['password'] = new_password

    # Atualiza a sessão do admin
    session['username'] = new_username

    # Salvar as credenciais atualizadas se necessário (depende de como você gerencia a configuração do admin)
    # Se admin_credentials for persistido em algum lugar, salve aqui.
    # save_admin_credentials(admin_credentials) 

    return jsonify({'success': True, 'message': 'Credenciais do administrador atualizadas com sucesso'})

@app.route('/api/user/update_profile', methods=['POST'])
def api_user_update_profile():
    if 'user_type' not in session or session['user_type'] != 'client':
        return jsonify({'success': False, 'message': 'Usuário não logado ou sem permissão'})

    data = request.get_json()
    user_id = session['user_id']
    user = users_db.get(user_id)

    if not user:
        return jsonify({'success': False, 'message': 'Usuário não encontrado'})

    # Atualiza os campos fornecidos
    if data.get('new_password'):
        user['password'] = data['new_password']

    if data.get('new_email'):
        user['email'] = data['new_email']

    if data.get('new_name'):
        user['name'] = data['new_name']

    if data.get('new_phone'):
        user['phone'] = data['new_phone']

    # Se o username mudou, precisa recriar a entrada no dicionário
    current_username = user['username']
    new_username = data.get('new_username')
    if new_username and new_username != current_username:
        # Verifica se o novo username já existe
        if new_username in users_db:
            return jsonify({'success': False, 'message': 'Novo username já existe'})

        # Remove a entrada antiga e adiciona a nova
        del users_db[current_username]
        user['username'] = new_username
        users_db[new_username] = user

        # Atualiza a sessão
        session['user_id'] = new_username
        session['username'] = new_username
        session['user_data'] = user # Atualiza os dados do usuário na sessão
    else:
        # Atualiza apenas o nome na sessão se mudou
        session['user_data']['name'] = user['name'] # Atualiza os dados do usuário na sessão


    save_data()

    return jsonify({'success': True, 'message': 'Perfil atualizado com sucesso'})

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')

        # Procura usuário pelo email
        user_found = None
        user_key = None
        for username, user in users_db.items():
            if user.get('email') == email:
                user_found = user
                user_key = username
                break

        if not user_found:
            return jsonify({'success': False, 'message': 'Email não encontrado'})

        # Gera token de recuperação (em produção, usar biblioteca como itsdangerous)
        try:
            import secrets
            reset_token = secrets.token_urlsafe(32)
        except ImportError:
            import uuid
            reset_token = str(uuid.uuid4()).replace('-', '')

        # Salva o token temporariamente (em produção, usar banco de dados com expiração)
        if not hasattr(app, 'reset_tokens'):
            app.reset_tokens = {}

        app.reset_tokens[reset_token] = {
            'username': user_key, 
            'email': email,
            'created_at': datetime.now().isoformat()
        }

        # Simula envio de email (em produção, usar serviço real de email)
        reset_link = url_for('reset_password', token=reset_token, _external=True)

        # Log para demonstração (em produção, enviar email real)
        print(f"SIMULAÇÃO DE EMAIL ENVIADO:")
        print(f"Para: {email}")
        print(f"Assunto: Recuperação de Senha - Salon Beleza Dourada")
        print(f"Link de recuperação: {reset_link}")
        print(f"Token: {reset_token}")

        return jsonify({'success': True, 'message': 'Instruções enviadas por email'})

    return render_template('forgot_password.html')

@app.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    if request.method == 'GET':
        token = request.args.get('token')
        if not token or not hasattr(app, 'reset_tokens') or token not in app.reset_tokens:
            return redirect(url_for('login'))

        # Verifica se o token não expirou (24 horas)
        token_data = app.reset_tokens[token]
        created_at = datetime.fromisoformat(token_data['created_at'])
        if datetime.now() - created_at > timedelta(hours=24):
            del app.reset_tokens[token]
            return redirect(url_for('login'))

        return render_template('reset_password.html', token=token)

    if request.method == 'POST':
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')

        if not token or not hasattr(app, 'reset_tokens') or token not in app.reset_tokens:
            return jsonify({'success': False, 'message': 'Token inválido ou expirado'})

        token_data = app.reset_tokens[token]
        username = token_data['username']

        # Verifica se o token não expirou
        created_at = datetime.fromisoformat(token_data['created_at'])
        if datetime.now() - created_at > timedelta(hours=24):
            del app.reset_tokens[token]
            return jsonify({'success': False, 'message': 'Token expirado'})

        # Atualiza a senha do usuário
        if username in users_db:
            users_db[username]['password'] = new_password
            save_data()

            # Remove o token usado
            del app.reset_tokens[token]

            return jsonify({'success': True, 'message': 'Senha redefinida com sucesso'})
        else:
            # O usuário associado ao token não existe mais (improvável, mas possível)
            del app.reset_tokens[token] # Limpa o token
            return jsonify({'success': False, 'message': 'Usuário não encontrado para redefinição'})

@app.route('/logout')
def logout():
    session.clear() # Limpa toda a sessão
    return redirect(url_for('index'))

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    try:
        load_data()
        print(f"✅ Aplicação iniciada. Credenciais admin: {admin_credentials['username']}/****")
        print(f"✅ Usuários carregados: {len(users_db)}")
        print(f"✅ Agendamentos carregados: {len(bookings_db)}")
        print("🌟 Salon Beleza Dourada - Sistema Flask iniciado com sucesso!")
        print("📍 Acesse o Flask app: http://0.0.0.0:3000")
        print("📍 Acesse o React app: http://0.0.0.0:5000")
        app.run(host='0.0.0.0', port=3000, debug=True, threaded=True)
    except Exception as e:
        print(f"❌ Erro ao iniciar a aplicação: {e}")
        import traceback
        traceback.print_exc()
        print("🔄 Tentando iniciar com configurações básicas...")
        try:
            app.run(host='0.0.0.0', port=3000, debug=False, threaded=True)
        except Exception as e2:
            print(f"❌ Falha crítica: {e2}")
            exit(1)