
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
import time

def test_flask_app():
    """Testa se o Flask app está funcionando"""
    try:
        print("🧪 Testando Flask app...")
        response = requests.get('http://0.0.0.0:3000/', timeout=5)
        if response.status_code == 200:
            print("✅ Flask app está funcionando na porta 3000")
            return True
        else:
            print(f"❌ Flask app retornou status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar com Flask app: {e}")
        return False

def test_react_app():
    """Testa se o React app está funcionando"""
    try:
        print("🧪 Testando React app...")
        response = requests.get('http://0.0.0.0:5000/', timeout=5)
        if response.status_code == 200:
            print("✅ React app está funcionando na porta 5000")
            return True
        else:
            print(f"❌ React app retornou status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar com React app: {e}")
        return False

def test_login_endpoint():
    """Testa o endpoint de login"""
    try:
        print("🧪 Testando endpoint de login...")
        response = requests.get('http://0.0.0.0:3000/login', timeout=5)
        if response.status_code == 200:
            print("✅ Endpoint de login acessível")
            return True
        else:
            print(f"❌ Endpoint de login retornou status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao testar login: {e}")
        return False

def main():
    print("🔍 Iniciando diagnóstico do sistema...")
    print("=" * 50)
    
    # Aguarda um pouco para os serviços iniciarem
    print("⏳ Aguardando serviços iniciarem...")
    time.sleep(3)
    
    results = []
    
    # Teste Flask
    results.append(("Flask App", test_flask_app()))
    
    # Teste React  
    results.append(("React App", test_react_app()))
    
    # Teste Login
    results.append(("Login Endpoint", test_login_endpoint()))
    
    # Resultado final
    print("\n" + "=" * 50)
    print("📊 RESULTADO DO DIAGNÓSTICO:")
    
    all_ok = True
    for test_name, result in results:
        status = "✅ OK" if result else "❌ FALHA"
        print(f"{test_name}: {status}")
        if not result:
            all_ok = False
    
    if all_ok:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("🌟 O sistema está funcionando corretamente!")
        print("\n🔗 Acesse:")
        print("   Flask: http://0.0.0.0:3000")
        print("   React: http://0.0.0.0:5000")
    else:
        print("\n⚠️  ALGUNS TESTES FALHARAM!")
        print("Verifique os logs dos serviços para mais detalhes.")
    
    return 0 if all_ok else 1

if __name__ == "__main__":
    exit(main())
