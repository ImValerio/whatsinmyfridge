import React from "react";
import { Button, Input } from "../ui";

interface ContainerManagerProps {
  newContainerName: string;
  setNewContainerName: (val: string) => void;
  onContainerSubmit: (e: React.FormEvent) => void;
  isCreatingContainer: boolean;
}

export const ContainerManager = ({
  newContainerName, setNewContainerName, onContainerSubmit, isCreatingContainer
}: ContainerManagerProps) => (
  <section>
    <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-4">Add Container</h3>
    <form onSubmit={onContainerSubmit} className="space-y-3 bg-[#FDFCF9] p-6 rounded-[2rem] border border-gray-100">
      <Input
        value={newContainerName}
        onChange={(e) => setNewContainerName(e.target.value)}
        placeholder="e.g. Kitchen Fridge"
        required
        maxLength={30}
        disabled={isCreatingContainer}
      />
      <Button type="submit" isLoading={isCreatingContainer} variant="secondary" className="w-full">
        Add Space
      </Button>
    </form>
  </section>
);
