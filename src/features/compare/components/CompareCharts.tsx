"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PESO_COLORS } from "@/lib/constants";
import { MediaType } from "@prisma/client";
import type { BrandCompareData } from "../queries";

interface CompareChartsProps {
  data: BrandCompareData[];
}

export function CompareCharts({ data }: CompareChartsProps) {
  if (data.length < 2) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          2つ以上のブランドを選択してください
        </p>
      </div>
    );
  }

  // Prepare data for total engagement bar chart
  const engagementData = data.map((brand) => ({
    name: brand.brandName,
    engagement: brand.totalEngagement,
  }));

  // Prepare data for stacked bar chart (PESO breakdown)
  const pesoData = data.map((brand) => {
    const result: Record<string, string | number> = { name: brand.brandName };
    for (const mt of Object.values(MediaType)) {
      const breakdown = brand.mediaTypeBreakdown.find(
        (b) => b.mediaType === mt
      );
      result[mt] = breakdown?.count || 0;
    }
    return result;
  });

  const maxTopItems = Math.max(...data.map((d) => d.topPrItems.length));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>総エンゲージメント比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#3b82f6" name="エンゲージメント" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>メディア区分比率（PESO）</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pesoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.entries(PESO_COLORS).map(([key, value]) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="peso"
                      fill={value.color}
                      name={value.label}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>トップ施策比較</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>順位</TableHead>
                {data.map((brand) => (
                  <TableHead key={brand.brandId}>{brand.brandName}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(maxTopItems)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  {data.map((brand) => {
                    const item = brand.topPrItems[index];
                    return (
                      <TableCell key={brand.brandId}>
                        {item ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                style={{
                                  backgroundColor:
                                    PESO_COLORS[item.mediaType].color,
                                  color: "#fff",
                                }}
                                className="text-xs"
                              >
                                {PESO_COLORS[item.mediaType].label}
                              </Badge>
                            </div>
                            <p className="max-w-[200px] truncate text-sm">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.engagementCount.toLocaleString()} eng
                            </p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
