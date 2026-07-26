from django.contrib import admin
from .models import Cliente, Tarefa, Pasta, Arquivo, VersaoArquivo

admin.site.register(Cliente)
admin.site.register(Pasta)
admin.site.register(Arquivo)
admin.site.register(VersaoArquivo)

@admin.register(Tarefa)
class TarefaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'cliente', 'status', 'progresso', 'prazo')
    list_filter = ('status', 'cliente')