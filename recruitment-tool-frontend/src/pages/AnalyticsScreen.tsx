import { useContext, useEffect, useMemo, useState } from 'react';
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
import { Card, CardContent, Typography, Box, Slider } from '@mui/material';
import Loading from '../components/Loading';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
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
  const { recruiter } = useContext(UserContext);
  const navigate = useNavigate();

  // Slider value (updates immediately while dragging)
  const [sliderN, setSliderN] = useState<number>(5);
  // Actual N used to fetch (updates on release)
  const [n, setN] = useState<number>(5);

  useEffect(() => {
    if (!recruiter?.admin) {
      alert('Only Admins Can Access Analytics');
      navigate('/candidates');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await getTopNCandidates(n);
        if (!cancelled) setTopN(list);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, recruiter, n]);

  const data = useMemo(
    () => [...topN].sort((a, b) => Number(b.votes ?? 0) - Number(a.votes ?? 0)),
    [topN],
  );

  if (loading) return <Loading />;
  if (error) return <div>Failed to load: {error}</div>;

  // put above return (after `data`):
  const ROW_HEIGHT = 34; // ~pixels per bar (tweak to taste)
  const AXIS_PADDING = 80; // room for axes/labels/margins
  const MIN_VIEWPORT = 380; // current visible height
  const chartHeight = Math.max(
    MIN_VIEWPORT,
    data.length * ROW_HEIGHT + AXIS_PADDING,
  );

  return (
    <Card sx={{ p: 2, boxShadow: 3 }}>
      <CardContent>
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mr: 'auto' }}>
            Top {n} Candidates
          </Typography>

          <Box sx={{ minWidth: 220 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Show top N: <strong>{sliderN}</strong>
            </Typography>
            <Slider
              value={sliderN}
              min={3}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              onChange={(_, v) => setSliderN(Array.isArray(v) ? v[0] : v)}
              onChangeCommitted={(_, v) => setN(Array.isArray(v) ? v[0] : v)}
              aria-label="Top N slider"
            />
          </Box>
        </Box>

        {/* replace the existing chart <Box ...> with this */}
        <Box
          sx={{
            width: '100%',
            maxHeight: 380, // visible window
            overflowY: 'auto', // scroll vertically when too many bars
            overflowX: 'hidden', // or 'auto' if you also want horizontal scroll
            pr: 1, // keep scrollbar from overlapping chart
            borderRadius: 1,
          }}
        >
          {/* inner container gives the chart its full height */}
          <Box
            sx={{
              height: chartHeight,
              minWidth: 520 /* optional for labels */,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 16, right: 24, left: 100, bottom: 16 }}
                barCategoryGap={8} // keep bars readable
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
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  interval={0}
                />
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
        </Box>
      </CardContent>
    </Card>
  );
}
