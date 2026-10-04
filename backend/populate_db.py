import os
import django
from datetime import date, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from gestao.models import Cliente, Projeto, Tarefa, Subtarefa, Pasta, Arquivo, Evento
from django.core.files.base import ContentFile

def populate():
    print("--- Limpando dados existentes no banco ---")
    Arquivo.objects.all().delete()
    Subtarefa.objects.all().delete()
    Tarefa.objects.all().delete()
    Evento.objects.all().delete()
    Pasta.objects.all().delete()
    Projeto.objects.all().delete()
    Cliente.objects.all().delete()

    print("--- Criando Clientes ---")
    c1 = Cliente.objects.create(
        nome="Carlos Eduardo Silva",
        ddi="+55",
        ddd="18",
        telefone="99712-3456",
        codigo_acesso="CLI1020",
        deletado=False
    )
    c2 = Cliente.objects.create(
        nome="Mariana Albuquerque",
        ddi="+55",
        ddd="11",
        telefone="98455-6789",
        codigo_acesso="CLI2030",
        deletado=False
    )
    c3 = Cliente.objects.create(
        nome="Roberto & Fernanda Guimarães",
        ddi="+55",
        ddd="18",
        telefone="99123-7890",
        codigo_acesso="CLI3040",
        deletado=False
    )
    c4 = Cliente.objects.create(
        nome="TechSpace Inovações Ltda",
        ddi="+55",
        ddd="11",
        telefone="97654-3210",
        codigo_acesso="CLI4050",
        deletado=False
    )
    c5_excluido = Cliente.objects.create(
        nome="Juliana Mendes de Castro",
        ddi="+55",
        ddd="19",
        telefone="99876-5432",
        codigo_acesso="CLI5060",
        deletado=True
    )

    print("--- Criando Obras / Projetos ---")
    p1 = Projeto.objects.create(
        cliente=c1,
        nome_projeto="Residência Alphaville",
        tipo_projeto="Residencial",
        fase_atual="Execução de Obra",
        cep="19060-000",
        rua="Av. das Esmeraldas",
        numero="1420",
        bairro="Alphaville",
        cidade="Presidente Prudente",
        uf="SP",
        arquivado=False
    )

    p2 = Projeto.objects.create(
        cliente=c2,
        nome_projeto="Casa de Campo Villa Real",
        tipo_projeto="Residencial",
        fase_atual="Projeto Executivo",
        cep="19800-000",
        rua="Estrada Municipal dos Ipês",
        numero="S/N - Km 4",
        bairro="Zona Rural",
        cidade="Assis",
        uf="SP",
        arquivado=False
    )

    p3 = Projeto.objects.create(
        cliente=c3,
        nome_projeto="Espaço Gourmet & Lazer",
        tipo_projeto="Interiores",
        fase_atual="Anteprojeto",
        cep="17500-100",
        rua="Rua das Palmeiras",
        numero="315",
        bairro="Jardim América",
        cidade="Marília",
        uf="SP",
        arquivado=False
    )

    p4 = Projeto.objects.create(
        cliente=c4,
        nome_projeto="Sede Corporativa TechSpace",
        tipo_projeto="Comercial",
        fase_atual="Estudo Preliminar",
        cep="04538-132",
        rua="Av. Brigadeiro Faria Lima",
        numero="2800",
        bairro="Itaim Bibi",
        cidade="São Paulo",
        uf="SP",
        arquivado=False
    )

    p5_arquivado = Projeto.objects.create(
        cliente=c2,
        nome_projeto="Loft Urbano Jardins",
        tipo_projeto="Residencial",
        fase_atual="Concluído",
        cep="01419-001",
        rua="Alameda Ministro Rocha Azevedo",
        numero="880",
        bairro="Cerqueira César",
        cidade="São Paulo",
        uf="SP",
        arquivado=True
    )

    print("--- Criando Tarefas e Subtarefas do Kanban ---")
    # WIP
    t1 = Tarefa.objects.create(
        projeto=p1,
        titulo="Detalhamento de Esquadrias e Alumínio",
        descricao="Especificar dimensões de corte e perfis em alumínio preto para todas as portas de correr da varanda.",
        categoria="Arquitetura",
        prazo=date(2026, 9, 29),
        prioridade="urgente",
        status="WIP",
        progresso=30,
        arquivado=False
    )
    Subtarefa.objects.create(tarefa=t1, titulo="Conferir vãos in loco na obra", concluida=True)
    Subtarefa.objects.create(tarefa=t1, titulo="Definir espessura dos vidros acústicos", concluida=False)
    Subtarefa.objects.create(tarefa=t1, titulo="Solicitar orçamento com o serralheiro", concluida=False)

    t2 = Tarefa.objects.create(
        projeto=p4,
        titulo="Estudo Volumétrico e Carta Solar",
        descricao="Simulação 3D no software de análise bioclimática para redução da carga térmica na fachada poente.",
        categoria="Conceitual",
        prazo=date(2026, 10, 5),
        prioridade="normal",
        status="WIP",
        progresso=50,
        arquivado=False
    )
    Subtarefa.objects.create(tarefa=t2, titulo="Levantar massa predial do entorno", concluida=True)
    Subtarefa.objects.create(tarefa=t2, titulo="Calcular brises necessários", concluida=False)

    t3 = Tarefa.objects.create(
        projeto=p3,
        titulo="Paginação de Pisos e Revestimentos",
        descricao="Definir paginação do porcelanato ripado e detalhamento da bancada em granito São Gabriel escovado.",
        categoria="Interiores",
        prazo=date(2026, 9, 30),
        prioridade="revisao",
        status="WIP",
        progresso=25,
        arquivado=False
    )
    Subtarefa.objects.create(tarefa=t3, titulo="Cálculo de metragem com 10% de perda", concluida=True)
    Subtarefa.objects.create(tarefa=t3, titulo="Especificar rejunte epóxi acetinado", concluida=False)

    # SHARED
    t4 = Tarefa.objects.create(
        projeto=p1,
        titulo="Compatibilização de Projetos Complementares",
        descricao="Cruzamento entre projeto hidrossanitário e estrutural para evitar furações em vigas de transição.",
        categoria="Estrutural",
        prazo=date(2026, 9, 28),
        prioridade="urgente",
        status="SHARED",
        progresso=70,
        arquivado=False
    )
    Subtarefa.objects.create(tarefa=t4, titulo="Sobrepor plantas no CAD/BIM", concluida=True)
    Subtarefa.objects.create(tarefa=t4, titulo="Identificar pontos de interferência crítica", concluida=True)
    Subtarefa.objects.create(tarefa=t4, titulo="Enviar relatório ao engenheiro calculista", concluida=False)

    t5 = Tarefa.objects.create(
        projeto=p2,
        titulo="Modelagem 3D e Renders Realistas",
        descricao="Produção de 4 imagens em alta resolução com iluminação natural diurna e iluminação cênica noturna.",
        categoria="3D / Renders",
        prazo=date(2026, 10, 2),
        prioridade="normal",
        status="SHARED",
        progresso=66,
        arquivado=False
    )
    Subtarefa.objects.create(tarefa=t5, titulo="Texturização de materiais naturais (pedra e madeira)", concluida=True)
    Subtarefa.objects.create(tarefa=t5, titulo="Ajuste de vegetação e paisagismo 3D", concluida=True)
    Subtarefa.objects.create(tarefa=t5, titulo="Render final em 4K para aprovação do cliente", concluida=False)

    # PUBLISHED
    t6 = Tarefa.objects.create(
        projeto=p1,
        titulo="Aprovação do Projeto Legal na Prefeitura",
        descricao="Emissão de ART/RRT e protocolo das pranchas no setor de planejamento urbano do município.",
        categoria="Documentação",
        prazo=date(2026, 9, 20),
        prioridade="normal",
        status="PUBLISHED",
        progresso=100,
        arquivado=False
    )
    Subtarefa.objects.create(tarefa=t6, titulo="Montar prancha no padrão da prefeitura", concluida=True)
    Subtarefa.objects.create(tarefa=t6, titulo="Assinatura dos memoriais pelos proprietários", concluida=True)
    Subtarefa.objects.create(tarefa=t6, titulo="Alvará de construção emitido e arquivado", concluida=True)

    t7 = Tarefa.objects.create(
        projeto=p2,
        titulo="Briefing Conceitual e Programa de Necessidades",
        descricao="Entrevista de alinhamento com a família para definição do estilo rústico contemporâneo e 4 suítes.",
        categoria="Briefing",
        prazo=date(2026, 9, 15),
        prioridade="normal",
        status="PUBLISHED",
        progresso=100,
        arquivado=False
    )
    Subtarefa.objects.create(tarefa=t7, titulo="Questionário de hábitos e rotina", concluida=True)
    Subtarefa.objects.create(tarefa=t7, titulo="Montagem do Moodboard aprovado", concluida=True)

    print("--- Criando Eventos do Calendário ---")
    Evento.objects.create(
        titulo="Visita Técnica ao Canteiro de Obras",
        descricao="Conferência da armadura de fundação e nível da terraplenagem com o mestre de obras.",
        data=date(2026, 9, 27),
        horario=time(10, 0),
        duracao_minutos=90,
        projeto=p1,
        concluido=True
    )

    Evento.objects.create(
        titulo="Reunião de Compatibilização Hidráulica",
        descricao="Alinhamento com engenheiro projetista para aprovar desvios dos shafts principais.",
        data=date(2026, 9, 28),
        horario=time(14, 30),
        duracao_minutos=60,
        projeto=p1,
        concluido=False
    )

    Evento.objects.create(
        titulo="Apresentação do Moodboard de Interiores",
        descricao="Apresentação de paleta de cores, amostras de tecidos e revestimentos no escritório.",
        data=date(2026, 9, 29),
        horario=time(16, 0),
        duracao_minutos=60,
        projeto=p3,
        concluido=False
    )

    Evento.objects.create(
        titulo="Medição In Loco - Casa de Campo",
        descricao="Levantamento métrico das árvores nativas para implantação da piscina e deck.",
        data=date(2026, 9, 30),
        horario=time(9, 0),
        duracao_minutos=120,
        projeto=p2,
        concluido=False
    )

    Evento.objects.create(
        titulo="Reunião Conceitual - Diretoria TechSpace",
        descricao="Apresentação da volumetria preliminar e zoneamento dos setores corporativos.",
        data=date(2026, 10, 2),
        horario=time(15, 0),
        duracao_minutos=60,
        projeto=p4,
        concluido=False
    )

    print("--- Criando Documentos nas Pastas dos Projetos ---")
    pastas_p1 = Pasta.objects.filter(projeto=p1)
    pasta_doc_p1 = pastas_p1.filter(nome__icontains="Documentação").first()
    pasta_plantas_p1 = pastas_p1.filter(nome__icontains="Plantas").first()
    pasta_imagens_p1 = pastas_p1.filter(nome__icontains="Imagens").first()
    pasta_orc_p1 = pastas_p1.filter(nome__icontains="Orçamentos").first()

    if pasta_doc_p1:
        pasta_doc_p1.visivel_cliente = True
        pasta_doc_p1.save()
        arq1 = Arquivo(
            nome="Briefing_Completo_Familia_Silva.pdf",
            projeto=p1,
            pasta=pasta_doc_p1,
            visivel_cliente=True,
            tamanho_bytes=2450000,
            comentario="Documento com levantamento das preferências e necessidades da família."
        )
        arq1.arquivo.save("Briefing_Completo_Familia_Silva.pdf", ContentFile(b"%PDF-1.4 Mock Briefing Document"), save=True)

    if pasta_plantas_p1:
        pasta_plantas_p1.visivel_cliente = True
        pasta_plantas_p1.save()
        arq2 = Arquivo(
            nome="Planta_Baixa_Executiva_Rev03.dwg",
            projeto=p1,
            pasta=pasta_plantas_p1,
            visivel_cliente=False,
            tamanho_bytes=15800000,
            comentario="Revisão 03 com cotas de paredes e vãos de esquadrias."
        )
        arq2.arquivo.save("Planta_Baixa_Executiva_Rev03.dwg", ContentFile(b"Mock DWG Binary File Content"), save=True)

    if pasta_imagens_p1:
        pasta_imagens_p1.visivel_cliente = True
        pasta_imagens_p1.save()
        arq3 = Arquivo(
            nome="Perspectiva_Fachada_Principal_4K.jpg",
            projeto=p1,
            pasta=pasta_imagens_p1,
            visivel_cliente=True,
            tamanho_bytes=6200000,
            comentario="Render 3D final com iluminação vespertina."
        )
        arq3.arquivo.save("Perspectiva_Fachada_Principal_4K.jpg", ContentFile(b"Mock JPG Image Binary Content"), save=True)

    if pasta_orc_p1:
        arq4 = Arquivo(
            nome="Planilha_Quantitativos_Fase01.xlsx",
            projeto=p1,
            pasta=pasta_orc_p1,
            visivel_cliente=False,
            tamanho_bytes=840000,
            comentario="Orçamento estimativo de materiais e mão de obra."
        )
        arq4.arquivo.save("Planilha_Quantitativos_Fase01.xlsx", ContentFile(b"Mock Excel Binary Content"), save=True)

    print("\nBanco de dados populado com sucesso com dados fictícios profissionais!")
    print(f"Total Clientes: {Cliente.objects.count()} (incluindo 1 excluído)")
    print(f"Total Projetos: {Projeto.objects.count()} (incluindo 1 arquivado)")
    print(f"Total Tarefas: {Tarefa.objects.count()}")
    print(f"Total Subtarefas: {Subtarefa.objects.count()}")
    print(f"Total Eventos: {Evento.objects.count()}")
    print(f"Total Arquivos: {Arquivo.objects.count()}")

if __name__ == '__main__':
    populate()
