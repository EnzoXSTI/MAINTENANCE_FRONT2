import css from './Input.module.css'

export default function Input({ label, type = "text", input, alterarInput, placeholder, required = false }) {
    return (
        <div className={css.inputGroup}>
            <label className={css.label}>{label}</label>
            <input
                className={css.input}
                type={type}
                value={input}
                onChange={(e) => alterarInput(e)}
                placeholder={placeholder}
                required={required}
            />
        </div>
    )
}
