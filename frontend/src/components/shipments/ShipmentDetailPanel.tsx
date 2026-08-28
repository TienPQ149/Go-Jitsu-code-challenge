import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShipment } from "../../hooks/useShipment";
import { useUpdateShipment } from "../../hooks/useShipmentMutations";

const editShipmentSchema = z.object({
  delivery_by_date: z.string().min(1, "Required"),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

type EditShipmentForm = z.infer<typeof editShipmentSchema>;

interface ShipmentDetailPanelProps {
  shipmentId: string | undefined;
}

/** Converts an ISO datetime string to the `YYYY-MM-DDTHH:mm` format `<input type="datetime-local">` expects. */
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function ShipmentDetailPanel({ shipmentId }: ShipmentDetailPanelProps) {
  const { data: shipment, isLoading, isError } = useShipment(shipmentId);
  const updateMutation = useUpdateShipment(shipmentId ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditShipmentForm>({
    resolver: zodResolver(editShipmentSchema),
  });

  useEffect(() => {
    if (shipment) {
      reset({
        delivery_by_date: toDatetimeLocalValue(shipment.delivery_by_date),
        lat: shipment.lat,
        lng: shipment.lng,
      });
    }
  }, [shipment, reset]);

  if (!shipmentId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Select a shipment to see its details.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Loading shipment…
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        Failed to load shipment.
      </div>
    );
  }

  const onSubmit = (values: EditShipmentForm) => {
    updateMutation.mutate({
      delivery_by_date: new Date(values.delivery_by_date).toISOString(),
      lat: values.lat,
      lng: values.lng,
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-semibold text-gray-900">{shipment.label}</h2>
      <p className="text-sm text-gray-500 mb-4">{shipment.id}</p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
        <dt className="text-gray-500">Client</dt>
        <dd className="text-gray-900">{shipment.client_name}</dd>

        <dt className="text-gray-500">Status</dt>
        <dd className="text-gray-900">{shipment.status}</dd>

        <dt className="text-gray-500">Arrival date</dt>
        <dd className="text-gray-900">
          {new Date(shipment.arrival_date).toLocaleString()}
        </dd>

        <dt className="text-gray-500">ETA</dt>
        <dd className="text-gray-900">{new Date(shipment.eta).toLocaleString()}</dd>

        <dt className="text-gray-500">Warehouse</dt>
        <dd className="text-gray-900">{shipment.warehouse_id}</dd>

        <dt className="text-gray-500">Assignment</dt>
        <dd className="text-gray-900">{shipment.assignment_id ?? "—"}</dd>
      </dl>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery by date
          </label>
          <input
            type="datetime-local"
            {...register("delivery_by_date")}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.delivery_by_date && (
            <p className="mt-1 text-xs text-red-600">
              {errors.delivery_by_date.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              {...register("lat")}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.lat && (
              <p className="mt-1 text-xs text-red-600">{errors.lat.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              {...register("lng")}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.lng && (
              <p className="mt-1 text-xs text-red-600">{errors.lng.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </button>
          {updateMutation.isSuccess && (
            <span className="text-sm text-green-600">Saved.</span>
          )}
          {updateMutation.isError && (
            <span className="text-sm text-red-600">Failed to save.</span>
          )}
        </div>
      </form>
    </div>
  );
}
