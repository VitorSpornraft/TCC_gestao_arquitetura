from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY: Obtida via variável de ambiente para nunca expor a chave de assinatura criptográfica no repositório.
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-8be$k0-%an_8obab$e&dipw!fta0tndj__+gi%s#ku6u2)4m79' # Fallback para dev local
)

# Detecta se o ambiente atual é a nuvem do Render (produção)
IS_PRODUCTION = bool(os.environ.get('RENDER') or os.environ.get('RENDER_SERVICE_ID'))

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG: Desativado em produção (Render) por segurança; em desenvolvimento local é True por padrão.
DEBUG = os.environ.get('DEBUG', 'False' if IS_PRODUCTION else 'True').lower() in ('true', '1', 't')

# ALLOWED_HOSTS: Restringe os domínios que podem acessar a aplicação, prevenindo ataques de HTTP Host Header Poisoning.
allowed_hosts_env = os.environ.get('ALLOWED_HOSTS')
if allowed_hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]
else:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com'] if not DEBUG else ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',
    'django.contrib.staticfiles',
    'cloudinary',
    'rest_framework',
    'corsheaders',
    'gestao',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

# DATABASES: Configuração flexível via variáveis de ambiente.
# No Render (PostgreSQL), consome DATABASE_URL; em desenvolvimento local, utiliza SQLite.
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    try:
        import dj_database_url
        DATABASES = {'default': dj_database_url.parse(DATABASE_URL)}
    except ImportError:
        import urllib.parse
        url = urllib.parse.urlparse(DATABASE_URL)
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': url.path[1:],
                'USER': url.username,
                'PASSWORD': url.password,
                'HOST': url.hostname,
                'PORT': url.port or 5432,
            }
        }
else:
    DATABASES = {
        'default': {
            'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),
            'NAME': os.environ.get('DB_NAME', BASE_DIR / 'db.sqlite3'),
        }
    }


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'pt-br'

TIME_ZONE = 'America/Sao_Paulo'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==============================================================================
# ARMAZENAMENTO DE ARQUIVOS (CLOUDINARY STORAGE)
# ==============================================================================

# Lê a URL de conexão do Cloudinary definida no ambiente (Render ou .env)
# Formato esperado: cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>
CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL')
if CLOUDINARY_URL:
    os.environ['CLOUDINARY_URL'] = CLOUDINARY_URL
elif not IS_PRODUCTION:
    # Em desenvolvimento/testes locais sem Cloudinary configurado, define valor de fallback para evitar erros de inicialização
    os.environ.setdefault('CLOUDINARY_URL', 'cloudinary://dummy:dummy@dummy')

CLOUDINARY_STORAGE = {
    'CLOUDINARY_URL': os.environ.get('CLOUDINARY_URL'),
}

# CRÍTICO: Configuração do storage de arquivos para arquivos brutos (raw).
# Garante suporte a PDFs, arquivos CAD (.dwg, .rvt, .skp) e imagens sem conversões destrutivas do Cloudinary.
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.RawMediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage" if not DEBUG else "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Compatibilidade para versões do Django anteriores a 4.2 ou bibliotecas legadas
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.RawMediaCloudinaryStorage'

# ==============================================================================
# SEGURANÇA: CABEÇALHOS HTTP E FORÇAR HTTPS
# ==============================================================================

# Reconhece conexões HTTPS terminadas pelo proxy reverso do Render (evita loops infinitos de redirecionamento)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Força o redirecionamento de requisições HTTP para HTTPS em produção no Render (desativado em dev para permitir localhost)
SECURE_SSL_REDIRECT = IS_PRODUCTION and not DEBUG

# Garante que os cookies de sessão sejam transmitidos apenas via HTTPS em produção, prevenindo interceptação (MitM)
SESSION_COOKIE_SECURE = IS_PRODUCTION and not DEBUG

# Garante que o cookie CSRF trafegue exclusivamente por HTTPS em produção
CSRF_COOKIE_SECURE = IS_PRODUCTION and not DEBUG

# Ativa o cabeçalho X-XSS-Protection nos navegadores compatíveis para bloquear scripts maliciosos refletidos
SECURE_BROWSER_XSS_FILTER = True

# Define X-Content-Type-Options: nosniff, impedindo o navegador de inferir o tipo MIME e executar arquivos como scripts
SECURE_CONTENT_TYPE_NOSNIFF = True

# Previne Clickjacking (X-Frame-Options: DENY), impedindo que o sistema seja renderizado dentro de iframes
X_FRAME_OPTIONS = 'DENY'


# ==============================================================================
# CORS (CROSS-ORIGIN RESOURCE SHARING) & CSRF ORIGINS
# ==============================================================================

# Remove a permissão irrestrita a qualquer origem, evitando requisições não autorizadas à API
CORS_ALLOW_ALL_ORIGINS = False

# Origens permitidas para requisições da API vindas do frontend (busca da variável de ambiente separada por vírgula)
cors_origins_env = os.environ.get('CORS_ALLOWED_ORIGINS')
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
else:
    # Origens padrão para desenvolvimento local com React/Vite
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

# Origens confiáveis para validação CSRF em requisições seguras (Django 4.0+)
csrf_trusted_env = os.environ.get('CSRF_TRUSTED_ORIGINS')
if csrf_trusted_env:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_trusted_env.split(',') if origin.strip()]
elif not DEBUG:
    CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ==============================================================================
# REST FRAMEWORK: AUTENTICAÇÃO E RATE LIMITING (THROTTLING)
# ==============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        # Proteção contra DoS / scraping para requisições de usuários não autenticados
        'anon': '10/minute',
        # Limite de taxa operacional padrão para usuários autenticados
        'user': '100/minute',
        # Proteção severa anti-força-bruta em rotas sensíveis (Login, Registro, OTP)
        'auth': '5/minute',
    },
}

# --- CONFIGURAÇÃO DE ENVIO DE E-MAILS (GMAIL SMTP) ---
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'seu-email@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'sua-senha-de-app')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
