import '@shopify/ui-extensions/preact';
import {render} from "preact";
import { useState } from "preact/hooks";
import { useMemo } from "preact/hooks";
import { useCallback } from "preact/hooks";

// 1. Export the extension
export default function() {
  render(<Extension />, document.body)
}

function Extension() {
  const [selectedDate, setSelectedDate] = useState("");
  const [yesterday, setYesterday] = useState("");

  // Sets the selected date to today, unless today is Sunday, then it sets it to tomorrow
  useMemo(() => {
    let today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const deliveryDate = today.getDay() === 0 ? tomorrow : today;

    setSelectedDate(formatDate(deliveryDate));
    setYesterday(formatDate(yesterday));
  }, []);

  // Set a function to handle the Date Picker component's onChange event
  const handleChangeDate = useCallback((event) => {
    setSelectedDate(event.target.value);
  }, []);

  return (
    <>
      <s-heading>Select a date for delivery</s-heading>
      <s-date-picker
        value={selectedDate}
        onChange={handleChangeDate}
        disallow={`--${yesterday}`}
        disallowDays="sunday"
      />
    </>
  )
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
