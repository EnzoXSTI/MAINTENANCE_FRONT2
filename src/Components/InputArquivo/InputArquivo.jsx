import { useState } from 'react'
import css from './InputArquivo.module.css'

export default function InputArquivo({ required = false, alterarInput, label = "Foto de Perfil" }) {

    const [nomeArquivo, setNomeArquivo] = useState('')

    function handleChange(e) {
        const file = e.target.files[0]
        if (file) {
            setNomeArquivo(file.name)
        }
        if (alterarInput) alterarInput(e)
    }

    return (
        <div className={css.inputGroup}>
            <label className={css.label}>
                {label}
            </label>
            <label className={css.botao}>
                {nomeArquivo ? (
                    <span className={css.nomeArquivo}>{nomeArquivo}</span>
                ) : (
                    <img src="/subir_arquivo.png" alt="Enviar arquivo" className={css.icone} />
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className={css.inputFile}
                />
            </label>
        </div>
    )
}
