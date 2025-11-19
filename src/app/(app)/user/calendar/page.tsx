"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Utilidad para obtener el día de la semana de una fecha YYYY-MM-DD en local
function getWeekDayFromDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return weekDays[date.getDay()];
}

export default function CalendarPage() {
  const { user, token } = useAuthStore();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });
  const [serviceOrders, setServiceOrders] = useState<Array<{
    providerId: string;
    id: string;
    service: { duration: number };
  }>>([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchServiceOrders();
      fetchAppointments();
    }
  }, [user]);

  const fetchServiceOrders = async () => {
    try {
      const { data } = await Api.get(`service-orders/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServiceOrders(
        data.map((order: any) => ({
          providerId: order.provider.id,
          id: order.id,
          service: { duration: order.service.duration },
        }))
      );
    } catch (error) {
      console.error("Error fetching service orders:", error);
      toast.error("Error al cargar las órdenes de servicio");
    }
  };

  const fetchAppointments = async () => {
    try {
      // Obtener el providerId igual que en fetchServiceOrders
      const { data: serviceOrdersData } = await Api.get(`service-orders/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const providerId = serviceOrdersData[0]?.provider.id;
      if (!providerId) return;
      const { data } = await Api.get(`appointments/find-by-provider`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { providerId },
      });
      console.log('Datos crudos recibidos del endpoint:', data);
      setAppointments(
        data.map((appointment: { id: string; title?: string; startTime: string }) => ({
          id: appointment.id,
          title: appointment.title || "Sin título",
          start: appointment.startTime,
        }))
      );
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error al cargar las citas");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submit ejecutado', formData, serviceOrders);

    const serviceOrder = serviceOrders[0];
    if (!serviceOrder) {
      toast.error("No se encontró una orden de servicio válida");
      return;
    }

    const { providerId, service } = serviceOrder;
    const { duration } = service;

    try {
      const { data: schedules } = await Api.get(
        `appointments/schedules/${providerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Schedules obtenidos:', schedules);

      // Usar función robusta para obtener el día de la semana
      const selectedDay = getWeekDayFromDate(formData.date);
      console.log('selectedDay:', selectedDay);

      const validSchedules = schedules.filter(
        (schedule: any) => schedule.day === selectedDay
      );
      console.log('validSchedules:', validSchedules);

      if (validSchedules.length === 0) {
        toast.error("No hay horarios disponibles para ese día");
        return;
      }

      for (const schedule of validSchedules) {
        const selectedTime = formData.time;
        if (
          selectedTime >= schedule.startTime.slice(0, 5) &&
          selectedTime < schedule.endTime.slice(0, 5)
        ) {
          const startTime = new Date(`${formData.date}T${selectedTime}`);
          const endTime = new Date(startTime.getTime() + duration * 60000);

          const appointmentData = {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            providerId,
            userId: user?.id,
            scheduleId: schedule.id,
          };

          console.log("Datos enviados al backend:", appointmentData);

          try {
            await Api.post(`appointments`, appointmentData, {
              headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(
              `Cita agendada exitosamente para el horario ${schedule.id}`
            );
          } catch (error) {
            console.error(
              `Error al agendar la cita para el horario ${schedule.id}:`,
              error
            );
            toast.error(`Error al agendar la cita para el horario ${schedule.id}`);
          }
        } else {
          console.log('Hora seleccionada fuera del rango del schedule:', schedule);
        }
      }
    } catch (error) {
      console.error("Error al obtener los horarios del proveedor:", error);
      toast.error("Error al obtener los horarios del proveedor");
    }
  };

  return (
    <main className="flex flex-col justify-start bg--background overflow-x-hidden overflow-y-hidden min-h-screen px-2 pb-20 md:pb-4 max-w-[1300px] mx-auto">
      <h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
        Calendario
      </h1>

      {/* Formulario para agendar citas */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mt-6"
      >
        <h2 className="text-xl font-semibold mb-4">Agendar una cita</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            Agendar
          </button>
        </div>
      </form>

      {/* Calendario visual */}
      <div className="mt-10">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={appointments}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
        />
      </div>
    </main>
  );
}
