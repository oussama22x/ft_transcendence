"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 5.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""
from pathlib import Path
from datetime import timedelta
from environ import Env
import os
import environ
from dotenv import load_dotenv



if os.path.exists(".env"):
    load_dotenv(".env")

BASE_DIR = Path(__file__).resolve().parent.parent


DEBUG = os.environ.get('DEBUG')
SECRET_KEY = os.environ.get('SECRET_KEY')

# ALLOWED_HOSTS= os.environ.get('ALLOWED_HOSTS', '*').split(',')
ALLOWED_HOSTS= ['*']


# Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent

# Env.read_env(BASE_DIR / '.env') # reading .env file
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!


# SECURITY WARNING: don't run with debug turned on in production!


ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'accounts',
    'corsheaders',
    'friend',
    'game',
    'tictac',
    'blockchain',
    
    'rest_framework_simplejwt.token_blacklist',
    'django_otp',
    'django_otp.plugins.otp_totp',


    
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = "backend.asgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

REST_FRAMEWORK={
    'NON_FIELD_ERRORS_KEY':'error',
        'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )

}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'BLACKLIST_AFTER_ROTATION': True,

}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':'postgres',
        'USER':  'postgres',
        'PASSWORD':'postgres',
        'HOST': 'postgres',
        'PORT': '5432',
    }
}

AUTH_USER_MODEL = 'accounts.MyUser'


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field


# Looking to send emails in production? Check out our Email API/SMTP product!
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
EMAIL_HOST='sandbox.smtp.mailtrap.io'
EMAIL_HOST_USER='erraoui.1937@gmail.com' 
EMAIL_HOST_PASSWORD='mkqgcklpbludpkft'
EMAIL_PORT = '2525'
DEFAULT_FROM_EMAIL='info@aymenauth.com'
EMAIL_USE_TLS=True


OTP_TOTP_ISSUER = 'YourAppName'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


CLIENT_ID=os.environ.get('CLIENT_ID')

CLIENT_SECRET=os.environ.get('CLIENT_SECRET')


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}


ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
CORS_ALLOW_CREDENTIALS = True


HOST_IP=os.environ.get('HOST_IP')

FRONTEND_URL="https://" +HOST_IP+":8443/#/"
REDIRECT_URI= "https://"+HOST_IP+":8443/accounts/callback/"