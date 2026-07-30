from django.contrib import admin
from .models import Cliente, Projeto, Tarefa, Pasta, Arquivo

# Registrando as tabelas para elas aparecerem no painel do Django Admin
admin.site.register(Cliente)
admin.site.register(Projeto)
admin.site.register(Tarefa)
admin.site.register(Pasta)
admin.site.register(Arquivo)