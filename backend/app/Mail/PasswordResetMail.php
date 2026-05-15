<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $resetUrl;
    public $userName;

    /**
     * Create a new message instance.
     */
    public function __construct($email, $token, $userName = 'User')
    {
        // Get frontend URL (handle comma-separated list)
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        if (strpos($frontendUrl, ',') !== false) {
            $frontendUrl = explode(',', $frontendUrl)[0];
        }
        $frontendUrl = trim($frontendUrl);
        
        $this->resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($email);
        $this->userName = $userName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Your Brokenshire Hotel Account Password',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
