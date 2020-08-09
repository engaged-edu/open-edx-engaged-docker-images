const CustomEventBridge = require("../utils/customEventBridge");
const connection = require("../utils/MySql");

const student_courseenrollment = async (event) => {
    const { affectedRows } = event;
    if (affectedRows && affectedRows.length > 0) {
        // Percorrer lista de affectedrows do evento, pegando o id do aluno em cada after e adicionando em um array
        const ids = affectedRows.map(({ after }) => after.user_id);
        // Buscar a lista de alunos mandando todos os ids de uma vez para que seja feita apenas uma pesquisa.
        connection.query(
            `select * from auth_user where id IN (${ids.toString()})`,
            function (error, results, fields) {
                if (error) {
                    console.log(
                        new Date(),
                        "student_courseenrollment > Erro ao realizar pesquisa de aluno >",
                        error
                    );
                    return;
                }
                if (results && results.length > 0) {
                    // Distribui em cada affectedrow seu aluno correspondente
                    affectedRows.forEach((affectedRow) => {
                        for (let i = 0; i < results.length; i++) {
                            const student = { ...results[i] };
                            console.log(
                                student,
                                student.id,
                                affectedRow.after.user_id
                            );
                            if (student.id === affectedRow.after.user_id) {
                                affectedRow.after_student = student;
                                break;
                            }
                        }
                    });
                    console.log(
                        JSON.stringify({ ...event, affectedRows }, null, 2)
                    );
                    const eventToSend = {
                        Time: new Date(),
                        EventBusName: process.env.BUS_NAME,
                        Source: process.env.SOURCE,
                        DetailType: process.env.DETAIL_TYPE,
                        Detail: JSON.stringify({ ...event, affectedRows }),
                    };
                    // Envia o evento
                    console.log(
                        new Date(),
                        "student_courseenrollment > Enviando evento para o EventBridge >",
                        eventToSend
                    );
                    CustomEventBridge.putEvents(eventToSend);
                }
            }
        );
    }
};

module.exports = student_courseenrollment;
