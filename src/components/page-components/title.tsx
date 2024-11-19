import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function TitleCard({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
