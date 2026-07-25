-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES_PLUS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age_group" "AgeGroup",
ADD COLUMN     "gender" "Gender";
