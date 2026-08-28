import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateShipment } from "../../hooks/useShipmentMutations";

const createShipmentSchema = z.object({
  client_name: z.string().min(1, "Required"),
  label: z.string().min(1, "Required"),
});

type CreateShipmentForm = z.infer<typeof createShipmentSchema>;

interface CreateShipmentModalProps {
  onClose: () => void;
  onCreated: (id: string) => void;
}

/**
 * Minimal create form: only asks for the two fields the exercise calls out
 * as required (client_name, label). Everything else (status=OPEN, dates,
 * warehouse, lat/lng) gets sensible defaults from the backend service.
 */
export function CreateShipmentModal({ onClose, onCreated }: CreateShipmentModalProps) {
  const createMutation = useCreateShipment();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateShipmentForm>({ resolver: zodResolver(createShipmentSchema) });

  const onSubmit = (values: CreateShipmentForm) => {
    createMutation.mutate(values, {
      onSuccess: (created) => {
        if (created) onCreated(created.id);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 p-4">
      <div className="relative z-[1001] w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          New shipment
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client name
            </label>
            <input
              type="text"
              {...register("client_name")}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            {errors.client_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.client_name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              placeholder="e.g. LAX-581-250521-6"
              {...register("label")}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.label && (
              <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>
            )}
          </div>

          {createMutation.isError && (
            <p className="text-xs text-red-600">Failed to create shipment.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
