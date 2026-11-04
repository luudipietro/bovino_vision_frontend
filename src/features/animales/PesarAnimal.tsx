import { Scale } from "lucide-react";
import { Link } from "react-router-dom";
import type { Uuid } from "../../api/tipos";
import { type ButtonVariant, buttonStyles } from "../../components/buttonStyles";
import { rutaDeCapturaParaAnimal } from "../captura/rutaDeCaptura";

/** "Pesar este animal" (CU-21): opens the capture page with the animal already identified. */
export default function PesarAnimal({
  idAnimal,
  variant = "primary",
}: {
  idAnimal: Uuid;
  variant?: ButtonVariant;
}) {
  return (
    <Link to={rutaDeCapturaParaAnimal(idAnimal)} className={buttonStyles(variant)}>
      <Scale className="h-[18px] w-[18px]" />
      Pesar este animal
    </Link>
  );
}
