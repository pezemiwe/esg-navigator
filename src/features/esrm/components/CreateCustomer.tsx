import React from "react";
import ESSStep from "./ESSStep";

interface CreateCustomerProps {
  onCreateProject: (projectData: any) => void;
  onSaveDraft?: (projectData: any) => void;
}

const CreateCustomer: React.FC<CreateCustomerProps> = ({ onSaveDraft }) => {
  return <ESSStep onSaveDraft={onSaveDraft} />;
};

export default CreateCustomer;
