import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter, RotateCcw, Star } from 'lucide-react';

export default function ProductFilters({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  availableFilters 
}) {
  // Local state for pending filters
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [ratingHover, setRatingHover] = useState(0);

  // Sync when filters change externally (e.g., clear all)
  useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  const handleBrandToggle = (brand) => {
    const newBrands = pendingFilters.brands?.includes(brand)
      ? pendingFilters.brands.filter(b => b !== brand)
      : [...(pendingFilters.brands || []), brand];
    setPendingFilters({ ...pendingFilters, brands: newBrands });
  };

  const handleSpecToggle = (spec, value) => {
    const currentValues = pendingFilters[spec] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setPendingFilters({ ...pendingFilters, [spec]: newValues });
  };

  const handleApplyFilters = () => {
    onFilterChange(pendingFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      brands: [],
      ram: [],
      storage: [],
      processor: [],
      minPrice: 0,
      maxPrice: 5000,
      minRating: 0,
      inStockOnly: false
    };
    setPendingFilters(clearedFilters);
    onClearFilters();
  };

  const activeFiltersCount = 
    (filters.brands?.length || 0) + 
    (filters.ram?.length || 0) + 
    (filters.storage?.length || 0) + 
    (filters.processor?.length || 0);

  const pendingFiltersCount = 
    (pendingFilters.brands?.length || 0) + 
    (pendingFilters.ram?.length || 0) + 
    (pendingFilters.storage?.length || 0) + 
    (pendingFilters.processor?.length || 0);

  const hasChanges = JSON.stringify(pendingFilters) !== JSON.stringify(filters);

  return (
    <Card className="sticky top-4 shadow-md border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg font-semibold dark:text-gray-100">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge className="bg-blue-600 text-white dark:bg-blue-500">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Price Range
          </Label>
          <div className="px-2">
            <Slider
              min={0}
              max={5000}
              step={100}
              value={[pendingFilters.minPrice || 0, pendingFilters.maxPrice || 5000]}
              onValueChange={([min, max]) => 
                setPendingFilters({ ...pendingFilters, minPrice: min, maxPrice: max })
              }
              className="mb-3"
            />
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                ${pendingFilters.minPrice || 0}
              </span>
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                ${pendingFilters.maxPrice || 5000}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Minimum Rating
          </Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => {
                  setPendingFilters(prev => ({ 
                    ...prev, 
                    minRating: prev.minRating === rating ? 0 : rating 
                  }));
                }}
                onMouseEnter={() => setRatingHover(rating)}
                onMouseLeave={() => setRatingHover(0)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all ${
                  pendingFilters.minRating >= rating
                    ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-600'
                    : 'bg-white border-gray-200 hover:border-yellow-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-yellow-500'
                }`}
              >
                <Star 
                  className={`w-4 h-4 ${
                    pendingFilters.minRating >= rating || ratingHover >= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
                <span className={`text-sm font-medium ${
                  pendingFilters.minRating >= rating
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {rating}+
                </span>
              </button>
            ))}
          </div>
          {pendingFilters.minRating > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Showing products rated {pendingFilters.minRating} stars and above
            </p>
          )}
        </div>

        {/* Brands */}
        {availableFilters?.brands?.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Brand</Label>
            <div className="space-y-2">
              {availableFilters.brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={pendingFilters.brands?.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RAM */}
        {availableFilters?.ram?.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">RAM</Label>
            <div className="space-y-2">
              {availableFilters.ram.map((ram) => (
                <div key={ram} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ram-${ram}`}
                    checked={pendingFilters.ram?.includes(ram)}
                    onCheckedChange={() => handleSpecToggle('ram', ram)}
                  />
                  <label
                    htmlFor={`ram-${ram}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    {ram}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage */}
        {availableFilters?.storage?.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Storage</Label>
            <div className="space-y-2">
              {availableFilters.storage.map((storage) => (
                <div key={storage} className="flex items-center space-x-2">
                  <Checkbox
                    id={`storage-${storage}`}
                    checked={pendingFilters.storage?.includes(storage)}
                    onCheckedChange={() => handleSpecToggle('storage', storage)}
                  />
                  <label
                    htmlFor={`storage-${storage}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    {storage}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processor */}
        {availableFilters?.processor?.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Processor</Label>
            <div className="space-y-2">
              {availableFilters.processor.map((processor) => (
                <div key={processor} className="flex items-center space-x-2">
                  <Checkbox
                    id={`processor-${processor}`}
                    checked={pendingFilters.processor?.includes(processor)}
                    onCheckedChange={() => handleSpecToggle('processor', processor)}
                  />
                  <label
                    htmlFor={`processor-${processor}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    {processor}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Stock Only */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={pendingFilters.inStockOnly}
              onCheckedChange={(checked) => 
                setPendingFilters({ ...pendingFilters, inStockOnly: checked })
              }
            />
            <label
              htmlFor="in-stock"
              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer select-none"
            >
              In stock only
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <Button
            onClick={handleApplyFilters}
            disabled={!hasChanges}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-6 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
            {pendingFiltersCount > 0 && (
              <Badge className="ml-2 bg-white/20">
                {pendingFiltersCount}
              </Badge>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="w-full rounded-xl py-6 font-semibold border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400 transition-all dark:bg-gray-700 dark:border-gray-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}