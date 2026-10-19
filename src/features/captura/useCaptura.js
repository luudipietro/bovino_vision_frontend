import { useEffect, useState } from "react";
import { iniciarSesionCaptura, subirCaptura } from "../../api/capturas";
import { procesarPesaje } from "../../api/pesajes";

export function useCaptura() {
  const [sesionId, setSesionId] = useState(null);
  const [paso, setPaso] = useState("identificar");
  const [animal, setAnimal] = useState(null);
  const [captura, setCaptura] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    iniciarSesionCaptura()
      .then((sesion) => setSesionId(sesion.id))
      .catch((err) => setError(err.message));
  }, []);

  function seleccionarAnimal(animalSeleccionado) {
    setAnimal(animalSeleccionado);
    setCaptura(null);
    setResultado(null);
    setError(null);
    setPaso("foto");
  }

  async function subirFoto(archivo) {
    setCargando(true);
    setError(null);
    try {
      const nuevaCaptura = await subirCaptura({ sesionId, animalId: animal.id, archivo });
      setCaptura(nuevaCaptura);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function confirmarPesaje() {
    setCargando(true);
    setError(null);
    try {
      const nuevoResultado = await procesarPesaje(captura.id);
      setResultado(nuevoResultado);
      setPaso("resultado");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function pesarOtroAnimal() {
    setAnimal(null);
    setCaptura(null);
    setResultado(null);
    setError(null);
    setPaso("identificar");
  }

  function reintentarFoto() {
    setCaptura(null);
    setError(null);
  }

  return {
    sesionId,
    paso,
    animal,
    captura,
    resultado,
    cargando,
    error,
    seleccionarAnimal,
    subirFoto,
    confirmarPesaje,
    pesarOtroAnimal,
    reintentarFoto,
  };
}
