import css from './Input.module.css'

export default function Input({
                                  label,
                                  type = "text",
                                  input,
                                  alterarInput,
                                  placeholder,
                                  required = false,
                                  aceita = "ambos",
                                  limite = null,
                                  gordo = false
                              }) {

    function handleChange(e) {
        let valor = e.target.value;

        // Filtra o conteúdo com base na regra escolhida
        if (aceita === "numeros") {
            valor = valor.replace(/\D/g, ""); // Remove tudo que não for número
        } else if (aceita === "letras") {
            valor = valor.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); // Mantém apenas letras (com acentos) e espaços
        }

        // Limita a quantidade de caracteres
        if (limite !== null) {
            valor = valor.slice(0, limite);
        }

        // Sobrescreve o valor do evento antes de enviar para a função alterarInput original
        e.target.value = valor;
        alterarInput(e);
    }

    return (
        <div className={css.inputGroup}>
            <label className={css.label}>{label}</label>
            <input
                className={`${css.input} ${gordo ? css.gordo : ''}`}
                type={type}
                value={input}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
            />
        </div>
    )
}
