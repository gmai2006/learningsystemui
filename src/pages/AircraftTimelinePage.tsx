import React, { useEffect, useState } from "react";
import apiClient from "../api/ApiClient";
import {
  Clock,
  Wrench,
  Plane,
  AlertTriangle,
  ChevronDown
} from "lucide-react";

export type AircraftTimelineEvent = {
  eventId: string;
  aircraftId: string;
  eventType: string;
  title: string;
  description: string;
  eventDate: string;
  reference?: string;
  severity?: string;
};

type Props = {
  aircraftId: string;
};

export default function AircraftTimelinePage({ aircraftId }: Props) {
  const [events, setEvents] = useState<AircraftTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `aircrafttimeline/select?aircraftId=${aircraftId}&page=${page}&pageSize=20`
      );
      setEvents(res.data.content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [aircraftId, page]);

  const getIcon = (type: string) => {
    switch (type) {
      case "WORK_ORDER":
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case "UTILIZATION":
        return <Plane className="w-4 h-4 text-green-500" />;
      case "INSPECTION":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-xl font-semibold">Aircraft Timeline</div>

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e.eventId}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIcon(e.eventType)}
                <div className="font-medium">{e.title}</div>
              </div>
              <div className="text-xs text-zinc-500">
                {new Date(e.eventDate).toLocaleString()}
              </div>
            </div>

            {e.description && (
              <div className="text-sm text-zinc-600 mt-2">
                {e.description}
              </div>
            )}

            {e.reference && (
              <div className="text-xs text-blue-600 mt-1">
                Ref: {e.reference}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-1 px-4 py-2 border rounded-md text-sm hover:bg-zinc-50"
        >
          Load More <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="text-center text-sm text-zinc-500">Loading...</div>
      )}
    </div>
  );
}