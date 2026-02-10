import { useState } from "react";

export function useNextPreparerModal() {
  const [showModal, setShowModal] = useState(false);
  const [nextPreparer, setNextPreparer] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSubmit = () => {
    setNotificationSent(true);
    setTimeout(() => {
      setNotificationSent(false);
      setShowModal(false);
    }, 2000);
  };

  return {
    showModal,
    nextPreparer,
    notificationSent,
    setNextPreparer,
    openModal,
    closeModal,
    handleSubmit,
  };
}

export function useApproverModal() {
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSubmit = () => {
    if (selectedApprover && expectedCompletionDate) {
      setShowModal(false);
    }
  };

  return {
    showModal,
    selectedApprover,
    expectedCompletionDate,
    setSelectedApprover,
    setExpectedCompletionDate,
    openModal,
    closeModal,
    handleSubmit,
  };
}
