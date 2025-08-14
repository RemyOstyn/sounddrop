"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      richColors
      closeButton
      style={
        {
          "--normal-bg": "rgba(0, 0, 0, 0.8)",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--normal-text": "rgba(255, 255, 255, 0.9)",
          "--success-bg": "rgba(34, 197, 94, 0.1)",
          "--success-border": "rgba(34, 197, 94, 0.2)",
          "--success-text": "rgba(34, 197, 94, 1)",
          "--error-bg": "rgba(239, 68, 68, 0.1)",
          "--error-border": "rgba(239, 68, 68, 0.2)",
          "--error-text": "rgba(239, 68, 68, 1)",
          "--warning-bg": "rgba(245, 158, 11, 0.1)",
          "--warning-border": "rgba(245, 158, 11, 0.2)",
          "--warning-text": "rgba(245, 158, 11, 1)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "rgba(255, 255, 255, 0.9)",
        },
        className: "glass",
      }}
      {...props}
    />
  )
}

export { Toaster }
