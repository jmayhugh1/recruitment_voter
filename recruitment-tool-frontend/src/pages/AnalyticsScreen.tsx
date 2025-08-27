import { useEffect, useMemo, useState } from 'react';
import type { Candidate } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Loading from '../components/Loading';
const apiUrl = import.meta.env.VITE_API_URL as string;

async function getTopNCandidates(n: number): Promise<Candidate[]> {
  const res = await fetch(`${apiUrl}/top-n-candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n }),
  });
  if (!res.ok)
    throw new Error(`Failed to fetch top N: ${res.status} ${res.statusText}`);
  const data: unknown = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function AnalyticsScreen() {
  const [topN, setTopN] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await getTopNCandidates(5);
        if (!cancelled) setTopN(list);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(
    () => [...topN].sort((a, b) => Number(b.votes ?? 0) - Number(a.votes ?? 0)),
    [topN],
  );

  if (loading) {
    return <Loading />;
  }
  if (error) return <div>Failed to load: {error}</div>;

  return (
    <Card sx={{ p: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
          Top 5 Candidates
        </Typography>

        {data.length > 0 ? (
          <Box sx={{ width: '100%', height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.9)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.9)" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal
                  vertical={false}
                />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip
                  formatter={(v: number) => [`${v} votes`, 'Votes']}
                  labelFormatter={(label) => `Candidate: ${label}`}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar
                  dataKey="votes"
                  fill="url(#barGradient)"
                  radius={[0, 8, 8, 0]}
                >
                  <LabelList dataKey="votes" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography color="text.secondary">No data to display.</Typography>
        )}

        <ol style={{ marginTop: 16 }}>
          {data.map((c) => (
            <li key={c.id}>
              {c.name} — {c.votes} votes
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
