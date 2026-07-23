// Gera src/content/cities/{uf}-{cidade}.json para as cidades da lista CITIES.
// Rodar com: node scripts/seed-cities.mjs
// Cidades que já têm arquivo (ex.: sp-ribeirao-preto.json, sp-santo-andre.json
// com conteúdo real customizado) são preservadas e NUNCA sobrescritas.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CITIES_DIR = join(__dirname, '..', 'src', 'content', 'cities');

const CITIES = [
  ["Maceió","AL"],["Manaus","AM"],["Macapá","AP"],["Feira de Santana","BA"],
  ["Porto Seguro","BA"],["Salvador","BA"],["Fortaleza","CE"],["Brasília","DF"],
  ["São Mateus","ES"],["Serra","ES"],["Vila Velha","ES"],["Anápolis","GO"],
  ["Aparecida de Goiânia","GO"],["Goiânia","GO"],["Rio Verde","GO"],["São Luís","MA"],
  ["Belo Horizonte","MG"],["Betim","MG"],["Contagem","MG"],["Juiz de Fora","MG"],
  ["Lagoa Santa","MG"],["Montes Claros","MG"],["Nova Lima","MG"],["Poços de Caldas","MG"],
  ["Pouso Alegre","MG"],["Santa Luzia","MG"],["Uberlândia","MG"],["Vespasiano","MG"],
  ["Campo Grande","MS"],["Cuiabá","MT"],["Ananindeua","PA"],["Belém","PA"],
  ["Campina Grande","PB"],["João Pessoa","PB"],["Patos","PB"],["Caruaru","PE"],
  ["Jaboatão dos Guararapes","PE"],["Petrolina","PE"],["Recife","PE"],
  ["Santa Cruz do Capibaribe","PE"],["Teresina","PI"],["Campo Largo","PR"],
  ["Colombo","PR"],["Curitiba","PR"],["Fazenda Rio Grande","PR"],["Londrina","PR"],
  ["Maringá","PR"],["Piraquara","PR"],["Ponta Grossa","PR"],["São José dos Pinhais","PR"],
  ["Barra Mansa","RJ"],["Belford Roxo","RJ"],["Campos dos Goytacazes","RJ"],
  ["Duque de Caxias","RJ"],["Niterói","RJ"],["Nova Iguaçu","RJ"],["Rio de Janeiro","RJ"],
  ["São Gonçalo","RJ"],["São João de Meriti","RJ"],["Volta Redonda","RJ"],["Natal","RN"],
  ["Porto Velho","RO"],["Boa Vista","RR"],["Campo Bom","RS"],["Caxias do Sul","RS"],
  ["Cruz Alta","RS"],["Erechim","RS"],["Lajeado","RS"],["Novo Hamburgo","RS"],
  ["Pelotas","RS"],["Porto Alegre","RS"],["Rio Grande","RS"],["Santa Cruz do Sul","RS"],
  ["Santa Maria","RS"],["São Leopoldo","RS"],["Barra Velha","SC"],["Florianópolis","SC"],
  ["Imbituba","SC"],["Joinville","SC"],["Palhoça","SC"],["Santo Amaro da Imperatriz","SC"],
  ["Aracaju","SE"],["Americana","SP"],["Araçatuba","SP"],["Atibaia","SP"],["Bauru","SP"],
  ["Birigui","SP"],["Bragança Paulista","SP"],["Campinas","SP"],["Campo Limpo Paulista","SP"],
  ["Diadema","SP"],["Franca","SP"],["Guarulhos","SP"],["Itanhaém","SP"],["Jundiaí","SP"],
  ["Mauá","SP"],["Mogi das Cruzes","SP"],["Monte Mor","SP"],["Osasco","SP"],
  ["Piracicaba","SP"],["Porto Feliz","SP"],["Praia Grande","SP"],["Presidente Prudente","SP"],
  ["Ribeirão Preto","SP"],["Rio Claro","SP"],["Salto","SP"],["Santa Bárbara d'Oeste","SP"],
  ["Santa Isabel","SP"],["Santo André","SP"],["Santos","SP"],["São Bernardo do Campo","SP"],
  ["São Caetano do Sul","SP"],["São Carlos","SP"],["São José do Rio Preto","SP"],
  ["São José dos Campos","SP"],["São Paulo","SP"],["São Roque","SP"],["São Sebastião","SP"],
  ["São Vicente","SP"],["Sorocaba","SP"],["Sumaré","SP"],["Várzea Paulista","SP"],
];

function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SERVICES = [
  {
    nome: 'Desentupimento de vaso sanitário',
    desc: 'Remoção de entupimentos em vasos sanitários residenciais e comerciais, sem quebra-quebra.',
    preco: '',
    img: '/images/servico-vaso-sanitario.webp',
    imgAlt: 'Profissional desentupindo vaso sanitário com fio de aço flexível',
    imgWidth: 800,
    imgHeight: 447,
  },
  {
    nome: 'Desentupimento de pia e ralo',
    desc: 'Solução rápida para pias de cozinha, banheiro e ralos de área de serviço.',
    preco: '',
    img: '/images/servico-pia-ralo.webp',
    imgAlt: 'Técnico desentupindo pia de cozinha com mangueira flexível de desentupimento',
    imgWidth: 800,
    imgHeight: 447,
  },
  {
    nome: 'Desentupimento de esgoto',
    desc: 'Localização e desobstrução de redes de esgoto residenciais com equipamento especializado.',
    preco: '',
    img: '/images/servico-esgoto.webp',
    imgAlt: 'Profissional desentupindo rede de esgoto residencial com máquina de limpeza em poço de visita',
    imgWidth: 800,
    imgHeight: 447,
  },
  {
    nome: 'Limpeza de caixa de gordura',
    desc: 'Limpeza completa e higienização de caixas de gordura para evitar mau cheiro e refluxo.',
    preco: '',
    img: '/images/servico-caixa-gordura.webp',
    imgAlt: 'Limpeza e higienização de caixa de gordura em cozinha comercial',
    imgWidth: 800,
    imgHeight: 447,
  },
];

const DIFFERENTIALS = [
  { titulo: 'Atendimento 24 horas', desc: 'Plantão todos os dias da semana, inclusive feriados.' },
  { titulo: 'Orçamento sem compromisso', desc: 'Avaliação no local antes de iniciar qualquer serviço.' },
  { titulo: 'Equipe própria', desc: 'Profissionais treinados, sem terceirização aleatória.' },
  { titulo: 'Sem quebra-quebra', desc: 'Equipamentos que preservam a tubulação e o acabamento do imóvel.' },
  { titulo: 'Garantia no serviço', desc: 'Garantia por escrito em todos os desentupimentos realizados.' },
  { titulo: 'Pagamento facilitado', desc: 'Aceita Pix, cartão e dinheiro, com nota fiscal quando solicitado.' },
];

// KPIs sem número fabricado (sem "+X atendimentos" ou nota média inventada) —
// só compromissos de política que valem para qualquer cidade antes de ter parceiro confirmado.
const KPIS = [
  { num: '24h', lbl: 'Plantão todos os dias' },
  { num: 'Grátis', lbl: 'Avaliação e orçamento sem compromisso' },
  { num: '100%', lbl: 'Equipe com equipamento próprio' },
  { num: 'Garantia', lbl: 'Por escrito em todo serviço' },
];

let created = 0;
let skipped = 0;

for (const [city, uf] of CITIES) {
  const slugCity = slugify(city);
  const slugUf = uf.toLowerCase();
  const filename = `${slugUf}-${slugCity}.json`;
  const filepath = join(CITIES_DIR, filename);

  if (existsSync(filepath)) {
    skipped++;
    continue;
  }

  const data = {
    city,
    uf,
    slugCity,
    slugUf,
    keyword: 'desentupidora',
    brand: {
      name: `Desentupidora ${city}`,
      logoUrl: '/images/logo-placeholder.svg',
    },
    phone: {
      display: '',
      tel: '',
    },
    whatsapp: {
      number: '',
      message: 'Olá! Preciso de uma desentupidora em {{CIDADE}}.',
    },
    conversionMode: 'leadster',
    leadsterEmbedId: `leadster-${slugUf}-${slugCity}-000`,
    kpis: KPIS,
    services: SERVICES,
    differentials: DIFFERENTIALS,
    neighborhoods: [],
    testimonials: [],
    partner: {
      name: `Parceiro local em ${city} — em breve`,
      address: '',
      mapEmbedUrl: '',
    },
  };

  if (!existsSync(CITIES_DIR)) {
    mkdirSync(CITIES_DIR, { recursive: true });
  }
  writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  created++;
}

console.log(`Cidades criadas: ${created}`);
console.log(`Cidades já existentes (preservadas): ${skipped}`);
console.log(`Total na lista: ${CITIES.length}`);
