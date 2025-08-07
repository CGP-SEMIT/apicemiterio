import { useState, useEffect } from "react";

import formStyles from './Form.module.css';
import Input from './input';
import Select from "./Select";

function SepultadoForm({ handleSubmit, sepultadoData, btnText }) {
  const [sepultado, setSepultado] = useState(sepultadoData || {});
  const [preview, setPreview] = useState([]);
  const tipoSepultura = ["Terra", "Laje", "Gaveta", "Jazigo", "Capela"];

  
  useEffect(() => {
    if (sepultadoData) {
      const imagensExistentes = sepultadoData.images || sepultadoData.image || [];
      setPreview(imagensExistentes);
      setSepultado({
        ...sepultadoData,
        images: imagensExistentes,
      });
    }
  }, [sepultadoData]); // ← SÓ sepultadoData como dependência

  function onFileChange(e) {
    const files = Array.from(e.target.files);
    setPreview(files); // substitui preview pelas novas imagens
    setSepultado({ ...sepultado, images: files });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setSepultado({ ...sepultado, [name]: value });
  }

  function submit(e) {
    e.preventDefault();
    handleSubmit(sepultado);
  }

  function renderImages() {
    if (preview.length > 0) {
      return preview.map((image, index) => {
        if (image instanceof File) {
          return (
            <img
              src={URL.createObjectURL(image)}
              alt={sepultado.nome || 'Sepultura'}
              key={`preview-${index}`}
            />
          );
        }

        const imageUrl = image.startsWith("http") || image.startsWith("/")
          ? image
          : `${process.env.REACT_APP_API}/images/sepultados/${image}`;

        return (
          <img
            src={imageUrl}
            alt={sepultado.nome || 'Sepultura'}
            key={`existing-${index}`}
          />
        );
      });
    }

    return <p>Nenhuma imagem disponível</p>;
  }

  return (
    <form onSubmit={submit} className={formStyles.form_container}>
      <div className={formStyles.preview_sepultado_image}>
        {renderImages()}
      </div>

      <Input
        text="Imagens da sepultura"
        type="file"
        name="images"
        handleOnChange={onFileChange}
        multiple={true}
        accept="image/*"
      />

      <Input
        text="Nome do Ente"
        type="text"
        name="nome"
        placeholder="Digite o nome"
        handleOnChange={handleChange}
        value={sepultado.nome || ''}
        required
      />

      <Input
        text="Idade"
        type="number"
        name="idade"
        placeholder="Digite a idade"
        handleOnChange={handleChange}
        value={sepultado.idade || ''}
        min="0"
        max="150"
      />

      <Input
        text="Data de Nascimento"
        type="date"
        name="dtNasc"
        placeholder="Digite data de nascimento"
        handleOnChange={handleChange}
        value={sepultado.dtNasc || ''}
      />

      <Input
        text="Data de Falecimento"
        type="date"
        name="dtFal"
        placeholder="Digite a data de falecimento"
        handleOnChange={handleChange}
        value={sepultado.dtFal || ''}
      />

      <Input
        text="nacionalidade"
        type="text"
        name="nacionalidade"
        placeholder="Digite a naturalidade"
        handleOnChange={handleChange}
        value={sepultado.nacionalidade || ''}
      />

      <Input
        text="Mãe"
        type="text"
        name="mae"
        placeholder="Digite a Mãe"
        handleOnChange={handleChange}
        value={sepultado.mae || ''}
      />

      <Input
        text="Pai"
        type="text"
        name="pai"
        placeholder="Digite o Pai"
        handleOnChange={handleChange}
        value={sepultado.pai || ''}
      />

      <Input
        text="Cemitério"
        type="text"
        name="cemiterio"
        placeholder="Digite o Cemitério"
        handleOnChange={handleChange}
        value={sepultado.cemiterio || ''}
      />

      <Input
        text="Quadra"
        type="text"
        name="quadra"
        placeholder="Digite a quadra"
        handleOnChange={handleChange}
        value={sepultado.quadra || ''}
      />

      <Input
        text="Rua"
        type="text"
        name="rua"
        placeholder="Digite a rua"
        handleOnChange={handleChange}
        value={sepultado.rua || ''}
      />

      <Input
        text="Chapa"
        type="text"
        name="chapa"
        placeholder="Digite a chapa"
        handleOnChange={handleChange}
        value={sepultado.chapa || ''}
      />

      <Input
  text="Epitáfio (Opcional)"
  type="textarea"
  name="epitafio" // <- aqui estava errado
  placeholder="Conte uma história de vida"
  handleOnChange={handleChange}
  value={sepultado.epitafio || ''}
/>


      <Select
        name="tipoSepultura"
        text="Tipo (Opcional)"
        options={tipoSepultura}
        handleOnChange={handleChange}
        value={sepultado.tipoSepultura || ''}
      />

      <input type="submit" value={btnText} />
    </form>
  );
}

export default SepultadoForm;