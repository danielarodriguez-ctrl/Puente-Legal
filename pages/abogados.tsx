export default function Abogados() {
  const formulario = process.env.NEXT_PUBLIC_TALLY_URL;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Dona unas horas de tu ejercicio
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-tinta/75">
        Miles de personas quedaron con problemas jurídicos después del terremoto y
        sin forma de pagar un abogado. Si te inscribes, el sistema te asigna casos
        de tu área, uno por uno, según tu turno en la lista.
      </p>

      <div className="mt-8 space-y-4 rounded-lg border-2 border-tinta/15 bg-white p-6">
        <h2 className="font-semibold">Cómo funciona para ti</h2>
        <ul className="space-y-3 text-tinta/80">
          <li className="flex gap-3">
            <span className="text-acento">→</span>
            Llenas el formulario una vez: tus datos, tus áreas y cuántos casos
            simultáneos puedes atender.
          </li>
          <li className="flex gap-3">
            <span className="text-acento">→</span>
            Cuando llega un caso de tu área y es tu turno, te llega un correo con
            el resumen y los datos de contacto de la persona.
          </li>
          <li className="flex gap-3">
            <span className="text-acento">→</span>
            Tú contactas a la persona dentro de 48 horas. El acompañamiento es
            telefónico o virtual, no presencial.
          </li>
          <li className="flex gap-3">
            <span className="text-acento">→</span>
            No recibes otro caso hasta que se libere un cupo, así que nadie se
            satura.
          </li>
        </ul>
      </div>

      {formulario ? (
        <a href={formulario} className="btn-primario mt-8" target="_blank" rel="noopener">
          Inscribirme como voluntario
        </a>
      ) : (
        <div className="mt-8 rounded-lg border-2 border-dashed border-tinta/25 p-5 text-tinta/60">
          Falta configurar la variable <code className="font-mono">NEXT_PUBLIC_TALLY_URL</code>{" "}
          con el enlace de tu formulario de Tally.
        </div>
      )}

      <p className="mt-8 text-sm leading-relaxed text-tinta/60">
        Al inscribirte aceptas que tus datos de contacto se compartan con las
        personas que te sean asignadas. Puedes pedir tu retiro de la lista en
        cualquier momento escribiendo al correo de coordinación.
      </p>
    </div>
  );
}
