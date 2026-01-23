import { useTable, useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface PricingPlan {
  id: string;
  discipline_id: string;
  num_people: number;
  num_months: number;
  price: number;
  created_at: string;
  discipline: {
    id: string;
    name: string;
  };
}

export const PricingList = () => {
  const { tableQueryResult } = useTable<PricingPlan>({
    resource: 'pricing',
  });

  const { push } = useNavigation();

  const { data, isLoading } = tableQueryResult;

  const deletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de eliminar este plan de precios?')) {
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.delete(`${API_URL}/pricing/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      tableQueryResult.refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar plan');
    }
  };

  const formatPrice = (price: number) => {
    return `Bs ${price.toFixed(2)}`;
  };

  const getPlanLabel = (numPeople: number, numMonths: number) => {
    const people = numPeople === 1 ? 'Individual' : `${numPeople} Personas`;
    const duration = numMonths === 1 ? '1 Mes' : `${numMonths} Meses`;
    return `${people} - ${duration}`;
  };

  // Agrupar planes por disciplina
  const groupByDiscipline = (plans: PricingPlan[]) => {
    const grouped: { [key: string]: PricingPlan[] } = {};
    plans.forEach((plan) => {
      const disciplineId = plan.discipline_id;
      if (!grouped[disciplineId]) {
        grouped[disciplineId] = [];
      }
      grouped[disciplineId].push(plan);
    });
    return grouped;
  };

  const groupedPlans = data?.data ? groupByDiscipline(data.data) : {};

  return (
    <AdminGymLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Planes de Precios</h1>
            <p className="text-sm text-gray-500 mt-1">
              {data?.total || 0} planes registrados
            </p>
          </div>
          <Button onClick={() => push('/admin-gym/pricing/create')}>
            <span className="hidden sm:inline">+ Crear Plan</span>
            <span className="sm:hidden">+ Crear</span>
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          </Card>
        ) : data?.data && data.data.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedPlans).map(([disciplineId, plans]) => (
              <Card key={disciplineId} title={plans[0].discipline.name}>
                {/* Vista Desktop - Tabla */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Tipo de Plan
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Personas
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Duración
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Precio
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((plan) => (
                        <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">
                              {getPlanLabel(plan.num_people, plan.num_months)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              {plan.num_people === 1 ? 'Individual' : `${plan.num_people} personas`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {plan.num_months} {plan.num_months === 1 ? 'mes' : 'meses'}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-green-600 text-lg">
                              {formatPrice(plan.price)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => push(`/admin-gym/pricing/edit/${plan.id}`)}
                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deletePlan(plan.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista Mobile - Cards */}
                <div className="lg:hidden space-y-3">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {getPlanLabel(plan.num_people, plan.num_months)}
                          </h4>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              {plan.num_people === 1 ? 'Individual' : `${plan.num_people} personas`}
                            </span>
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                              {plan.num_months} {plan.num_months === 1 ? 'mes' : 'meses'}
                            </span>
                          </div>
                        </div>
                        <p className="font-bold text-green-600 text-lg flex-shrink-0">
                          {formatPrice(plan.price)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => push(`/admin-gym/pricing/edit/${plan.id}`)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                        >
                          Editar Precio
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-sm lg:text-base">
                No hay planes de precios registrados
              </p>
              <Button onClick={() => push('/admin-gym/pricing/create')}>
                Crear Primer Plan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminGymLayout>
  );
};
