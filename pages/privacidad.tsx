export default function Privacidad() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Tratamiento de datos personales
      </h1>
      <p className="mt-2 text-tinta/60">Ley 1581 de 2012 y Decreto 1074 de 2015.</p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">Quién responde por tus datos</h2>
          <p className="mt-2 text-tinta/80">
            El responsable del tratamiento es{" "}
            <strong>{process.env.NEXT_PUBLIC_ORGANIZACION || "[nombre de la organización]"}</strong>.
            Para cualquier solicitud sobre tus datos, escribe a{" "}
            <strong>{process.env.NEXT_PUBLIC_EMAIL_CONTACTO || "[correo de contacto]"}</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Para qué usamos tus datos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-tinta/80">
            <li>Asignarte un abogado voluntario del área que corresponde a tu caso.</li>
            <li>Permitir que ese abogado te contacte por teléfono, WhatsApp o correo.</li>
            <li>Hacer seguimiento a si el caso fue atendido.</li>
            <li>Producir estadísticas agregadas y anónimas sobre la atención.</li>
          </ul>
          <p className="mt-3 text-tinta/80">
            No vendemos, cedemos ni usamos tus datos para publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Quién los ve</h2>
          <p className="mt-2 text-tinta/80">
            Únicamente el abogado voluntario que quede asignado a tu caso y el
            equipo de coordinación de la plataforma. Los datos se guardan cifrados
            en un servidor de base de datos con acceso restringido.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Tus derechos</h2>
          <p className="mt-2 text-tinta/80">
            Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar
            la autorización que diste. Basta con escribir al correo de contacto
            indicando tu número de caso. Respondemos dentro de los términos de ley:
            diez días hábiles para consultas y quince días hábiles para reclamos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cuánto tiempo los guardamos</h2>
          <p className="mt-2 text-tinta/80">
            Conservamos la información mientras dure el acompañamiento y hasta un
            año después del cierre del caso. Cumplido ese plazo, los datos de
            contacto se eliminan y solo queda el registro estadístico anónimo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Alcance del servicio</h2>
          <p className="mt-2 text-tinta/80">
            Puente Legal es un puente entre personas afectadas y abogados que
            donan su tiempo. La plataforma no presta servicios jurídicos ni
            responde por el concepto, la actuación o la omisión del abogado
            voluntario, quien actúa a título personal y bajo su propia
            responsabilidad profesional. La relación que surge entre la persona y
            el abogado es directa entre ellos.
          </p>
        </section>
      </div>
    </div>
  );
}
