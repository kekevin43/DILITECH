import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function ProductFormDialog({ open, onOpenChange, product, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'laptop',
    brand: '',
    description: '',
    price: 0,
    original_price: 0,
    stock: 0,
    images: [],
    specs: {
      processor: '',
      ram: '',
      storage: '',
      graphics: '',
      display: '',
      os: '',
      weight: '',
      connectivity: ''
    },
    rating: 0,
    reviews_count: 0,
    featured: false,
    trending: false
  });

  const [imageUrls, setImageUrls] = useState('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImageUrls(product.images?.join('\n') || '');
    } else {
      setFormData({
        name: '',
        category: 'laptop',
        brand: '',
        description: '',
        price: 0,
        original_price: 0,
        stock: 0,
        images: [],
        specs: {
          processor: '',
          ram: '',
          storage: '',
          graphics: '',
          display: '',
          os: '',
          weight: '',
          connectivity: ''
        },
        rating: 0,
        reviews_count: 0,
        featured: false,
        trending: false
      });
      setImageUrls('');
    }
  }, [product, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      toast.success('Product created successfully');
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.update(product.id, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const images = imageUrls.split('\n').filter(url => url.trim());
    const submitData = {
      ...formData,
      images,
      price: parseFloat(formData.price) || 0,
      original_price: parseFloat(formData.original_price) || 0,
      stock: parseInt(formData.stock) || 0,
      rating: parseFloat(formData.rating) || 0,
      reviews_count: parseInt(formData.reviews_count) || 0,
    };

    if (product) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Pricing & Stock</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price ($)</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Image URLs (one per line)</Label>
            <Textarea
              id="images"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              rows={4}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processor">Processor</Label>
                <Input
                  id="processor"
                  value={formData.specs.processor}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, processor: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input
                  id="ram"
                  value={formData.specs.ram}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, ram: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage</Label>
                <Input
                  id="storage"
                  value={formData.specs.storage}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, storage: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graphics">Graphics</Label>
                <Input
                  id="graphics"
                  value={formData.specs.graphics}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, graphics: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Display</Label>
                <Input
                  id="display"
                  value={formData.specs.display}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, display: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">Operating System</Label>
                <Input
                  id="os"
                  value={formData.specs.os}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, os: e.target.value } })}
                />
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Display Options</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <label htmlFor="featured" className="text-sm cursor-pointer">Featured Product</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trending"
                  checked={formData.trending}
                  onCheckedChange={(checked) => setFormData({ ...formData, trending: checked })}
                />
                <label htmlFor="trending" className="text-sm cursor-pointer">Trending Product</label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}