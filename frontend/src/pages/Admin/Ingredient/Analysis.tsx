import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API = "http://localhost:8000/api/v1";

type UsagePoint = {
  time: string;
  quantity: number;
};

export const IngredientAnalyticsPage: React.FC = () => {
  /* ---------------- filters ---------------- */
  const filters: FilterField[] = [
    {
      key: "ingredient_id",
      label: "Ingredient",
      type: "select-fetch",
      fetchUrl: `${API}/resources/ingredients`,
      col: 2,
    },
    {
      key: "start",
      label: "Start date",
      type: "date",
    },
    {
      key: "end",
      label: "End date",
      type: "date",
    },
  ];

  const [values, setValues] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<Record<string, any[]>>({});

  const onChange = (key: string, value: string) =>
    setValues((p) => ({ ...p, [key]: value }));

  const onFetchOptions = async (key: string, url: string) => {
    const res = await fetch(url);
    const body = await res.json();

    const items = Array.isArray(body) ? body : body.data ?? [];

    setOptions((p) => ({
      ...p,
      [key]: items.map((i: any) => ({
        label: i.name,
        value: String(i.id),
      })),
    }));
  };

  /* ---------------- usage chart ---------------- */
  const [usageData, setUsageData] = useState<UsagePoint[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const fetchUsage = async () => {
    const { ingredient_id, start, end } = values;

    if (!ingredient_id || !start || !end) {
      alert("Pick ingredient + start + end");
      return;
    }

    setLoadingUsage(true);

    const params = new URLSearchParams({
      start_date: `${start}T00:00:00`,
      end_date: `${end}T23:59:59`,
    }).toString();

    const res = await fetch(
      `${API}/resources/ingredient-analyses/usage/${ingredient_id}?${params}`
    );

    const raw = await res.json();

    const normalized = raw
      .sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .map((r: any) => ({
        time: new Date(r.created_at).toLocaleString(),
        quantity: r.new_quantity,
      }));

    setUsageData(normalized);
    setLoadingUsage(false);
  };

  /* ---------------- restock table ---------------- */
  const [restockRows, setRestockRows] = useState<any[]>([]);

  const fetchRestock = async () => {
    const res = await fetch(`${API}/resources/ingredient-analyses/restock`);
    const data = await res.json();
    setRestockRows(data);
  };

  useEffect(() => {
    fetchRestock();
  }, []);

  /* ---------------- render ---------------- */
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 26, fontWeight: 600 }}>
        Ingredient Usage History
      </h2>

      <FilterBar
        fields={filters.map((f) => ({
          ...f,
          options: options[f.key],
        }))}
        values={values}
        onChange={onChange}
        onFetchOptions={onFetchOptions}
      />

      <button onClick={fetchUsage} disabled={loadingUsage}>
        {loadingUsage ? "Loading…" : "Search"}
      </button>

      <div style={{ width: "100%", height: 320, marginTop: 24 }}>
        {usageData.length > 0 ? (
          <ResponsiveContainer>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="quantity"
                stroke="#6366f1"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ opacity: 0.6 }}>No data</p>
        )}
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 600, marginTop: 32 }}>
        Restock Prediction
      </h2>

      <table
        style={{
          width: "100%",
          marginTop: 12,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            {[
              "Ingredient",
              "Quantity",
              "Threshold",
              "Avg/day",
              "Days left",
              "Predicted restock",
            ].map((h) => (
              <th key={h} style={{ border: "1px solid #000", padding: 8 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {restockRows.map((r) => (
            <tr key={r.ingredient_id}>
              <td style={{ border: "1px solid #000", padding: 8 }}>
                {r.ingredient_name}
              </td>
              <td style={{ border: "1px solid #000", padding: 8 }}>
                {r.quantity}
              </td>
              <td style={{ border: "1px solid #000", padding: 8 }}>
                {r.threshold}
              </td>
              <td style={{ border: "1px solid #000", padding: 8 }}>
                {r.avg_daily_usage ?? "—"}
              </td>
              <td style={{ border: "1px solid #000", padding: 8 }}>
                {r.days_left?.toFixed(1) ?? "—"}
              </td>
              <td style={{ border: "1px solid #000", padding: 8 }}>
                {r.predicted_restock_time
                  ? new Date(r.predicted_restock_time).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
