// Configurações básicas
const ADMIN_PASSWORD = 'admin123';
let selectedAssets = [];
let timeframe = 1;

// Função de login
function handleLogin() {
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value.trim();

    if (!email || !password) {
        alert("Por favor, insira seu e-mail e senha.");
        return;
    }

    // Verifica se o e-mail está registrado
    fetch('http://localhost:3000/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.exists) {
                alert("E-mail não registrado. Entre em contato com o administrador.");
                return;
            }

            if (email === 'admin' && password === ADMIN_PASSWORD) {
                showAdminPanel();
                return;
            }

            alert("Login bem-sucedido!");
            showMainPage();
        })
        .catch((error) => {
            console.error('Erro:', error);
            alert("Ocorreu um erro ao verificar o e-mail.");
        });
}

// Mostra o painel do admin
function showAdminPanel() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
}

// Registrar novo usuário (feito pelo admin)
function registerUser() {
    const email = document.getElementById('newUserEmail').value.trim();

    if (!email) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    fetch('http://localhost:3000/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                document.getElementById('newUserEmail').value = '';
            }
        })
        .catch((error) => {
            console.error('Erro:', error);
            alert("Ocorreu um erro ao registrar o usuário.");
        });
}

// Mostra a página principal
function showMainPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
}

// Logout
function logout() {
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

// Seleciona ativos
document.querySelectorAll('.asset-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        selectedAssets = Array.from(document.querySelectorAll('.asset-checkbox:checked'))
            .map(cb => cb.value);
    });
});

// Define o timeframe
document.getElementById('timeframe').addEventListener('change', (e) => {
    timeframe = parseInt(e.target.value);
});

// Gera sinais
function startSignalGenerator() {
    if (selectedAssets.length === 0) {
        alert("Por favor, selecione pelo menos um ativo.");
        return;
    }
    setInterval(() => {
        const direction = Math.random() > 0.5 ? 'CALL' : 'PUT';
        const accuracy = Math.floor(Math.random() * 31) + 70;
        const asset = selectedAssets[Math.floor(Math.random() * selectedAssets.length)];
        const now = new Date();
        let signalTime;
        if (timeframe === 1) {
            signalTime = new Date(now.getTime() + (2 + Math.floor(Math.random() * 3)) * 60000); // Entre 2-4 minutos
        } else if (timeframe === 5) {
            signalTime = new Date(now.getTime() + (6 + Math.floor(Math.random() * 3)) * 60000); // Entre 6-8 minutos
        }
        const formattedTime = `${String(signalTime.getHours()).padStart(2, '0')}:${String(signalTime.getMinutes()).padStart(2, '0')}`;
        const signal = `
            <div class="signal-item glass-panel p-4 rounded-lg">
                <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-400">${formattedTime}</span>
                    <span class="px-3 py-1 rounded-full ${direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'}">
                        ${direction}
                    </span>
                </div>
                <div class="text-xl font-semibold mb-2">${asset}</div>
                <div>Precisão: ${accuracy}%</div>
            </div>
        `;
        const history = document.getElementById('signalHistory');
        history.insertAdjacentHTML('afterbegin', signal);
        // Mantém apenas 3 sinais no histórico
        const signals = history.children;
        if (signals.length > 3) signals[3].remove();
    }, timeframe === 1 ? 60000 : 300000); // Intervalo baseado no timeframe
}