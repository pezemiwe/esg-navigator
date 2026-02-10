import React from "react";
import ESSStep from "./ESSStep";

interface CreateCustomerProps {
  onCreateProject: (projectData: any) => void;
}

const CreateCustomer: React.FC<CreateCustomerProps> = ({}) => {
  return <ESSStep />;
};

export default CreateCustomer;
