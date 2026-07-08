-- CreateTable
CREATE TABLE "MoodItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MoodItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MoodItem" ADD CONSTRAINT "MoodItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
