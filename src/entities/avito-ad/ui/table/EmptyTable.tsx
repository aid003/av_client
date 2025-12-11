import { Package } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/components/ui/card';

export function EmptyTable() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Нет объявлений</h3>
            <p className="text-sm text-muted-foreground">
              Попробуйте изменить фильтры или синхронизируйте объявления
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
