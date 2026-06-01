import css from './InputSelect.module.css'

export default function InputSelect({
    label,
    valor,
    alterarValor,
    opcoes = [],
    required = false,
    placeholder = 'Selecione...'
}) {
    return (
        <div className={css.inputGroup}>
            <label className={css.label}>{label}</label>
            <select
                className={css.select}
                value={valor}
                onChange={e => alterarValor(e)}
                required={required}
            >
                <option value="">{placeholder}</option>
                {opcoes.map(op => (
                    <option key={op} value={op}>{op}</option>
                ))}
            </select>
        </div>
    )
}
