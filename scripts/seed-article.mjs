// Semeia um rascunho de exemplo num artigo para verificar a auditoria (Sprint 9).
// Uso: node scripts/seed-article.mjs <articleId>
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

const articleId = process.argv[2];
if (!articleId) {
  console.error("Passe o articleId.");
  process.exit(1);
}

const rows = await sql`SELECT id, workspace_id FROM article WHERE id = ${articleId}`;
if (rows.length === 0) {
  console.error("Artigo não encontrado.");
  process.exit(1);
}
const wsId = rows[0].workspace_id;

const content = {
  title: "Seguro fiança ou título de capitalização: o que escolher na sua imobiliária",
  metaTitle: "Seguro fiança vs. título de capitalização | Guia para imobiliárias",
  metaDescription:
    "Compare seguro fiança e título de capitalização para reduzir inadimplência e acelerar a aprovação na sua imobiliária. Veja prós, contras e quando usar cada um.",
  slug: "seguro-fianca-vs-titulo-de-capitalizacao",
  blocks: [
    { type: "h2", text: "O que é seguro fiança" },
    { type: "p", text: "O seguro fiança é uma garantia locatícia. Uma seguradora cobre a inadimplência do inquilino. Você reduz o risco de calote. A aprovação cadastral fica mais rápida. O locatário não precisa de fiador." },
    { type: "p", text: "Para a imobiliária, o ganho é direto. Menos atraso no aluguel. Mais previsibilidade no caixa. A carteira de locação cresce com menos risco." },
    { type: "h2", text: "O que é título de capitalização" },
    { type: "p", text: "O título de capitalização funciona como uma caução. O inquilino deposita um valor. Esse valor fica retido durante o contrato. A análise de crédito costuma ser mais simples. Em troca, exige capital imobilizado pelo inquilino." },
    { type: "p", text: "Esse modelo serve a quem tem caixa disponível. Não serve a quem quer preservar liquidez. Cada perfil pede uma escolha diferente." },
    { type: "h2", text: "Comparativo rápido" },
    { type: "p", text: "Seguro fiança: aprovação ágil, sem capital preso, custo recorrente. Título de capitalização: capital retido, menos análise, valor devolvido ao fim. A decisão depende do perfil do locatário e da meta da imobiliária." },
    { type: "h2", text: "Qual escolher" },
    { type: "p", text: "Quer escala e menos inadimplência? O seguro fiança tende a converter mais. Quer simplicidade para quem tem caixa? O título pode encaixar. Avalie caso a caso e respeite a análise de crédito." },
    { type: "h2", text: "Impacto na inadimplência" },
    { type: "p", text: "A inadimplência corrói a margem da imobiliária. Cada aluguel atrasado vira custo de cobrança. O seguro fiança transfere esse risco para a seguradora. O caixa fica mais previsível. O time de locação foca em fechar contratos, não em correr atrás de atraso." },
    { type: "p", text: "O título de capitalização também protege, mas de outra forma. O valor retido cobre eventuais perdas. A diferença está em quem imobiliza o capital. No seguro, ninguém prende dinheiro. No título, o inquilino prende." },
    { type: "h2", text: "Velocidade de aprovação" },
    { type: "p", text: "A velocidade muda a conversão. Um cadastro que demora perde o inquilino. O seguro fiança digital aprova em poucas etapas. O locatário responde rápido. A imobiliária fecha mais negócios no mesmo período. Menos burocracia, mais carteira." },
    { type: "p", text: "No título, a etapa extra é o depósito. Nem todo inquilino tem o valor à mão. Isso pode travar a locação. Por isso o seguro costuma escalar melhor em operações grandes." },
    { type: "h2", text: "Custos e previsibilidade" },
    { type: "p", text: "O custo do seguro fiança é recorrente. Ele entra no orçamento do inquilino mês a mês. Em troca, a imobiliária ganha previsibilidade. O risco de calote fica com a seguradora. Esse trade-off costuma valer a pena em carteiras grandes. Quanto maior o volume, maior o impacto de reduzir a inadimplência." },
    { type: "p", text: "O título de capitalização tem custo diferente. O inquilino imobiliza um valor de uma vez. Esse dinheiro não rende para ele durante o contrato. No fim, recebe de volta conforme as regras. Para quem tem caixa e disciplina, pode compensar. Para quem precisa de liquidez, pesa." },
    { type: "p", text: "Em ambos os casos, transparência é regra. Explique cada custo ao locatário. Mostre o que está incluso e o que não está. Evite letras miúdas que geram disputa depois. A confiança no começo reduz o atrito no fim." },
    { type: "h2", text: "Como decidir na prática" },
    { type: "p", text: "Comece pelo perfil da carteira. Veja o ticket médio do aluguel. Avalie o caixa típico do seu inquilino. Olhe a sua meta de crescimento. Se o objetivo é escala com baixo risco, o seguro tende a ganhar. Se o público tem caixa e prefere reaver o valor, o título cabe." },
    { type: "p", text: "Combine os dois quando fizer sentido. Ofereça opções ao locatário. Respeite sempre a análise de crédito. Nunca prometa aprovação sem critério. Transparência aumenta a confiança e reduz disputas depois." },
    { type: "faq", text: "Seguro fiança cobre danos ao imóvel? Depende da apólice; muitas cobrem aluguel e encargos, e algumas incluem danos. Confira as condições antes de contratar." },
    { type: "faq", text: "O título de capitalização é devolvido? Sim, ao fim do contrato o valor é resgatado conforme as regras do título." },
    { type: "p", text: "Quer reduzir a inadimplência e acelerar aprovações? Conheça a garantia locatícia digital da Avalyst e fale com nosso time para ver o melhor encaixe na sua operação." },
  ],
};

// Limpa versões/fontes/auditorias anteriores deste artigo (idempotente).
await sql`DELETE FROM audit_result WHERE article_id = ${articleId}`;
await sql`DELETE FROM article_source WHERE article_id = ${articleId}`;
await sql`DELETE FROM article_version WHERE article_id = ${articleId}`;

await sql`INSERT INTO article_version (article_id, workspace_id, content, author)
          VALUES (${articleId}, ${wsId}, ${JSON.stringify(content)}::jsonb, 'ai')`;

await sql`INSERT INTO article_source (article_id, workspace_id, kind, ref, excerpt, origin)
          VALUES (${articleId}, ${wsId}, 'doc', 'comparativo-garantia.txt', 'Comparativo de garantias locatícias', 'observado')`;
await sql`INSERT INTO article_source (article_id, workspace_id, kind, ref, excerpt, origin)
          VALUES (${articleId}, ${wsId}, 'serp', 'tokiomarine.com.br', 'Concorrente observado na SERP', 'observado')`;

await sql`UPDATE article SET status = 'review', title = ${content.title}, slug = ${content.slug} WHERE id = ${articleId}`;

console.log("Rascunho semeado no artigo", articleId, "(workspace", wsId + ").");
