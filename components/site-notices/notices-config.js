/*
  Avisos do site. Este arquivo é a única coisa que precisa mudar para
  publicar, alterar ou encerrar um aviso.

  COMO ADICIONAR UM AVISO
  1. Copie um bloco abaixo e coloque no início da lista.
  2. Troque o "id" por um valor novo e único. O id é o que controla quem já
     fechou o aviso: id novo significa que todo mundo vê de novo, id repetido
     significa que quem já fechou não vê mais.
  3. Escreva "titulo", "corpo" e "botao". Sem travessão na copy.
  4. Defina "inicio" e "fim" no formato ISO com o fuso de Brasília (-03:00).
     O aviso aparece a partir de "inicio" e some sozinho depois de "fim",
     sem precisar de novo deploy.

  REGRAS
  Só o primeiro aviso dentro da janela de datas é exibido. Se nenhum estiver
  na janela, nada é renderizado e o componente não faz mais nada.
  Para encerrar um aviso antes da hora, adiante o "fim" ou remova o bloco.
  Lista vazia é válido: o site simplesmente não mostra aviso nenhum.
*/

window.AT_SITE_NOTICES = [
  {
    id: "feriado-nsl-2026",
    titulo: "Aviso de feriado",
    corpo:
      "Na terça-feira, 8 de setembro, celebramos o feriado de Nossa Senhora da Luz, padroeira de Curitiba, e não haverá expediente. Nosso atendimento ficará limitado nesse dia. Você pode enviar seu orçamento normalmente pelo site. Os prazos das solicitações recebidas no feriado serão contados a partir de quarta-feira, 9 de setembro.",
    botao: "Entendi",
    inicio: "2026-09-07T00:00:00-03:00",
    fim: "2026-09-08T23:59:59-03:00",
  },
];
