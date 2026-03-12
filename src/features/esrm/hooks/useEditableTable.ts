import { useEffect, useState } from "react";

export function useEditableTable<T extends { id: number }>(
  initialItems: T[],
  emptyItemFactory: () => T,
  isEmptyCheck: (item: T) => boolean,
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<T>>({});

  useEffect(() => {
    setItems(initialItems);
    setEditingId(null);
    setEditForm({});
  }, [initialItems]);

  const addNewItem = () => {
    const newItem = emptyItemFactory();
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditForm({});
    }
  };

  const startEdit = (item: T) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId ? ({ ...item, ...editForm } as T) : item,
        ),
      );
      setEditingId(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    if (
      editingId &&
      items.find((item) => item.id === editingId && isEmptyCheck(item))
    ) {
      setItems((prev) => prev.filter((item) => item.id !== editingId));
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (field: keyof T, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return {
    items,
    setItems,
    editingId,
    editForm,
    addNewItem,
    deleteItem,
    startEdit,
    saveEdit,
    cancelEdit,
    handleInputChange,
  };
}
