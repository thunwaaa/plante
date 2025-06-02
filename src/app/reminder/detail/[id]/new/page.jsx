"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Droplet, Sprout } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestNotificationPermission } from "@/lib/notification";

const AddReminderPage = () => {
  const router = useRouter();
  const params = useParams();
  const plantId = params.id;

  console.log("[DEBUG] plantId", plantId, "length:", plantId.length);

  const [reminderData, setReminderData] = useState({
    type: "",
    frequency: "",
    scheduledDate: "",
    scheduledTime: "",
    dayOfWeek: "",
    timeOfDay: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function isValidObjectId(id) {
    return typeof id === "string" && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReminderData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (e) => {
    setReminderData((prevData) => ({ ...prevData, scheduledTime: e.target.value }));
  };

  const handleTimeChange = (e) => {
    setReminderData((prevData) => ({ ...prevData, timeOfDay: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Ensure notification permission and FCM token
    try {
      await requestNotificationPermission();
    } catch (err) {
      setError("กรุณาอนุญาตการแจ้งเตือนก่อนตั้งค่าการแจ้งเตือน");
      setIsSubmitting(false);
      return;
    }

    if (!isValidObjectId(plantId)) {
      setError("plantId ไม่ถูกต้อง (ต้องเป็น ObjectID 24 ตัวอักษร)");
      setIsSubmitting(false);
      return;
    }
    if (!reminderData.type || !reminderData.frequency) {
      setError("กรุณาเลือกประเภทและความถี่การแจ้งเตือน");
      setIsSubmitting(false);
      return;
    }
    if (
      reminderData.frequency === "once" &&
      (!reminderData.scheduledDate || !reminderData.scheduledTime)
    ) {
      setError("กรุณาเลือกวันที่และเวลาสำหรับการแจ้งเตือนครั้งเดียว");
      setIsSubmitting(false);
      return;
    }
    if (
      (reminderData.frequency === "daily" || reminderData.frequency === "weekly") &&
      !reminderData.timeOfDay
    ) {
      setError("กรุณาเลือกเวลาสำหรับการแจ้งเตือนรายวัน/รายสัปดาห์");
      setIsSubmitting(false);
      return;
    }
    if (reminderData.frequency === "weekly" && !reminderData.dayOfWeek) {
      setError("กรุณาเลือกวันในสัปดาห์สำหรับการแจ้งเตือนรายสัปดาห์");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const reminderPayload = {
        plantId: plantId,
        type: reminderData.type,
        frequency: reminderData.frequency,
        scheduledTime:
          reminderData.frequency === "once"
            ? new Date(`${reminderData.scheduledDate}T${reminderData.scheduledTime}`).toISOString()
            : undefined,
        dayOfWeek:
          reminderData.frequency === "weekly" ? reminderData.dayOfWeek : undefined,
        timeOfDay:
          reminderData.frequency === "daily" || reminderData.frequency === "weekly"
            ? reminderData.timeOfDay
            : undefined,
      };
      Object.keys(reminderPayload).forEach(
        (key) => reminderPayload[key] === undefined && delete reminderPayload[key]
      );
      console.log("[DEBUG] reminderPayload", reminderPayload);
      const res = await fetch(`${API_URL}/reminders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(reminderPayload),
      });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = { error: "ไม่สามารถอ่าน response จาก backend ได้" };
      }
      if (!res.ok) {
        console.error("[DEBUG] Backend error:", data);
        setError(data.error || "เกิดข้อผิดพลาด");
        setIsSubmitting(false);
        return;
      }
      toast.success("ตั้งค่าการแจ้งเตือนสำเร็จ!");
      router.push(`/reminder/detail/${plantId}`);
    } catch (err) {
      setError(err.message);
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-[#E6E4BB] min-h-screen">
      <h1 className="text-2xl font-bold text-center text-[#373E11]">
        เพิ่มแจ้งเตือนสำหรับพืช
      </h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8 space-y-6 p-6 rounded-lg border border-[#373E11]">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label className="block text-lg font-semibold mb-2">ประเภทการแจ้งเตือน:</label>
          <div className="grid">
            <label className="inline-flex items-center border p-2 mb-3 rounded-lg hover:bg-[#373E11] hover:text-[#E6E4BB] transition duration-300 ease-in-out">
              <input
                type="radio"
                name="type"
                value="watering"
                checked={reminderData.type === "watering"}
                onChange={handleInputChange}
                className="form-radio text-[#373E11]"
                required
              />
              <div className="flex ml-3 gap-1 items-center">
                <Droplet size={20} color="#00b0eb" />
                <span>รดน้ำ</span>
              </div>
            </label>
            <label className="inline-flex items-center border p-2 mb-3 rounded-lg hover:bg-[#373E11] hover:text-[#E6E4BB] transition duration-300 ease-in-out">
              <input
                type="radio"
                name="type"
                value="fertilizing"
                checked={reminderData.type === "fertilizing"}
                onChange={handleInputChange}
                className="form-radio text-[#373E11]"
                required
              />
              <div className="flex ml-3 items-center">
                <Sprout size={22} color="#018923" />
                <span className="ml-2">ใส่ปุ๋ย</span>
              </div>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-lg font-semibold mb-2">ความถี่:</label>
          <Select
            name="frequency"
            value={reminderData.frequency}
            onValueChange={(value) =>
              handleInputChange({ target: { name: "frequency", value } })
            }
            required
          >
            <SelectTrigger className="w-full mt-1 pl-3 py-2 text-base border-[#373E11] focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md">
              <SelectValue placeholder="เลือกความถี่" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="once">ครั้งเดียว</SelectItem>
                <SelectItem value="daily">ทุกวัน</SelectItem>
                <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {reminderData.frequency === "once" && (
          <div>
            <label className="block text-lg font-semibold mb-2">วันที่:</label>
            <input
              type="date"
              name="scheduledDate"
              value={reminderData.scheduledDate}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md"
              required
            />
            <label className="block text-lg font-semibold my-2">เวลา:</label>
            <input
              type="time"
              name="scheduledTime"
              value={reminderData.scheduledTime}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md"
              required
            />
          </div>
        )}
        {reminderData.frequency === "weekly" && (
          <div>
            <label className="block text-lg font-semibold mb-2">วันในสัปดาห์:</label>
            <Select
              name="dayOfWeek"
              value={reminderData.dayOfWeek}
              onValueChange={(value) =>
                handleInputChange({ target: { name: "dayOfWeek", value } })
              }
              required
            >
              <SelectTrigger className="w-full mt-1 pl-3 py-2 text-base border-[#373E11] focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md">
                <SelectValue placeholder="เลือกวัน" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Sunday">อาทิตย์</SelectItem>
                  <SelectItem value="Monday">จันทร์</SelectItem>
                  <SelectItem value="Tuesday">อังคาร</SelectItem>
                  <SelectItem value="Wednesday">พุธ</SelectItem>
                  <SelectItem value="Thursday">พฤหัสบดี</SelectItem>
                  <SelectItem value="Friday">ศุกร์</SelectItem>
                  <SelectItem value="Saturday">เสาร์</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {(reminderData.frequency === "daily" || reminderData.frequency === "weekly") && (
          <div>
            <label className="block text-lg font-semibold mb-2">เวลา:</label>
            <input
              type="time"
              name="timeOfDay"
              value={reminderData.timeOfDay}
              onChange={handleTimeChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-[#373E11] focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md"
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-[#373E11] text-[#E6E4BB] p-3 rounded-md font-medium hover:bg-[#454b28] transition-colors flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Droplet className="mr-2 h-5 w-5" />
          )}
          {isSubmitting ? "กำลังตั้งค่า..." : "ตั้งค่าการแจ้งเตือน"}
        </button>
      </form>
    </div>
  );
};

export default AddReminderPage; 