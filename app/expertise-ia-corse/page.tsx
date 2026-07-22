import { permanentRedirect } from "next/navigation";

export default function LegacyExpertiseIACorsePage() {
  permanentRedirect("/services");
}
