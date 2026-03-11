import { useState } from "react";

export function useNextPreparerModal() {
  const [showModal, setShowModal] = useState(false);
  const [nextPreparer, setNextPreparer] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSubmit = (onSuccess?: () => void) => {
    setNotificationSent(true);
    setTimeout(() => {
      setNotificationSent(false);
      setShowModal(false);
      onSuccess?.();
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
  const [notificationSent, setNotificationSent] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSubmit = (onSuccess?: () => void) => {
    if (selectedApprover && expectedCompletionDate) {
      setNotificationSent(true);
      setTimeout(() => {
        setNotificationSent(false);
        setShowModal(false);
        onSuccess?.();
      }, 2000);
    }
  };

  return {
    showModal,
    selectedApprover,
    expectedCompletionDate,
    notificationSent,
    setSelectedApprover,
    setExpectedCompletionDate,
    openModal,
    closeModal,
    handleSubmit,
  };
}
