import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PESO_COLORS } from "@/lib/constants";
import { MediaType } from "@prisma/client";

interface PrItem {
  id: string;
  title: string;
  sourceType: string;
  mediaType: MediaType;
  publishedAt: Date | string | null;
  brand?: { name: string };
  brandName?: string;
}

interface RecentPrItemsTableProps {
  prItems: PrItem[];
}

export function RecentPrItemsTable({ prItems }: RecentPrItemsTableProps) {
  if (prItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>直近のPRデータ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">データがありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>直近のPRデータ</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>ブランド</TableHead>
              <TableHead>メディア区分</TableHead>
              <TableHead>公開日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-[200px] truncate font-medium">
                  {item.title}
                </TableCell>
                <TableCell>{item.brandName || item.brand?.name}</TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: PESO_COLORS[item.mediaType].color,
                      color: "#fff",
                    }}
                  >
                    {PESO_COLORS[item.mediaType].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.publishedAt
                    ? format(
                        typeof item.publishedAt === "string"
                          ? new Date(item.publishedAt)
                          : item.publishedAt,
                        "M月d日",
                        { locale: ja }
                      )
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
