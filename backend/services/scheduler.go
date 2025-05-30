package services

import (
	"log"
	"time"
)

type Scheduler struct {
	notificationService *NotificationService
	stopChan            chan struct{}
}

func NewScheduler(notificationService *NotificationService) *Scheduler {
	return &Scheduler{
		notificationService: notificationService,
		stopChan:            make(chan struct{}),
	}
}

func (s *Scheduler) Start() {
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for {
			select {
			case <-ticker.C:
				if err := s.notificationService.CheckAndSendReminders(); err != nil {
					log.Printf("Error checking reminders: %v", err)
				}
			case <-s.stopChan:
				ticker.Stop()
				return
			}
		}
	}()
}

func (s *Scheduler) Stop() {
	close(s.stopChan)
}
