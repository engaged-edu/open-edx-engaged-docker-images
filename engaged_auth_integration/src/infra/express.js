oauth2_provider_accesstoken


{
  // Auto gerado
  id: 320,

  // Gerar random de 30 char (npm install randomstring)
  token: "yrSg0eVX4pb2ccoiwaQzGz4jJ7IHES",

  // 1 week (npm install moment)
  expires: "2020-07-10 21:19:33.901979000",

  // Fixo
  scope: "user_id email profile",

  // Fixo
  application_id: 1,

  // Id do usuário encontrado
  user_id: 10,

  // Data do momento da criação
  created: "2020-07-10 21:19:33.901979000",
  updated: "2020-07-10 21:19:33.901979000",
}

const now = new Date();
const expires = moment(now).add(1, 'week').toDate()
