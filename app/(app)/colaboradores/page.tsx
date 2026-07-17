import { getColaboradores } from "@/actions/folgas";
import { LinhaColaborador } from "./linha-colaborador";
import { FormNovoColaborador } from "./form-novo-colaborador";

export default async function ColaboradoresPage() {
  const colaboradores = await getColaboradores();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Colaboradores</h2>
        <div className="space-y-2">
          {colaboradores?.map((c) => (
            <LinhaColaborador key={c.id} colaborador={c} />
          ))}
          {(!colaboradores || colaboradores.length === 0) && (
            <p className="text-sm text-gray-500">Nenhum colaborador cadastrado.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
          Adicionar colaborador
        </h2>
        <FormNovoColaborador />
      </section>
    </div>
  );
}
