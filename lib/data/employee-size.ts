export interface EmployeeBucket {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

export const EMPLOYEE_BUCKETS: EmployeeBucket[] = [
  { id: "1-10", label: "1–10", min: 1, max: 10 },
  { id: "11-50", label: "11–50", min: 11, max: 50 },
  { id: "51-200", label: "51–200", min: 51, max: 200 },
  { id: "201-500", label: "201–500", min: 201, max: 500 },
  { id: "500+", label: "500+", min: 501, max: null },
];

export function employeeBucketOf(count: number | null | undefined): EmployeeBucket | null {
  if (count == null) return null;
  return (
    EMPLOYEE_BUCKETS.find((b) => count >= b.min && (b.max === null || count <= b.max)) ?? null
  );
}
